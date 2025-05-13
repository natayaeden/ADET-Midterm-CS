<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index()
    {
        $notifications = Auth::user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notifications);
    }
    
    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        
        // Make sure the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $notification->update(['is_read' => true]);
        
        return response()->json($notification);
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Auth::user()->notifications()->update(['is_read' => true]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }
    
    /**
     * Create a notification for a task assignment
     */
    public function notifyTaskAssigned(Task $task)
    {
        // Only notify if task is assigned to someone
        if (!$task->assigned_to) {
            return;
        }
        
        $user = User::find($task->assigned_to);
        $project = Project::find($task->project_id);
        
        if (!$user) {
            return;
        }
        
        Notification::create([
            'user_id' => $user->id,
            'type' => 'task_assigned',
            'related_id' => $task->id,
            'message' => "You have been assigned to the task: {$task->title}",
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'project_id' => $project->id,
                'project_name' => $project->name,
                'due_date' => $task->due_date
            ]
        ]);
    }
    
    /**
     * Create a notification for a task completion
     */
    public function notifyTaskCompleted(Task $task)
    {
        $project = Project::find($task->project_id);
        
        if (!$project || !$project->user_id) {
            return;
        }
        
        // Notify project manager
        Notification::create([
            'user_id' => $project->user_id,
            'type' => 'task_completed',
            'related_id' => $task->id,
            'message' => "Task '{$task->title}' has been completed",
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'project_id' => $project->id,
                'project_name' => $project->name,
                'completed_at' => now()
            ]
        ]);
    }
}