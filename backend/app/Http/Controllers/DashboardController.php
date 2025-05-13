<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        $user = Auth::user();
        
        // For managers, show all projects and tasks
        if ($user->role === 'manager') {
            $projectsCount = Project::count();
            $activeProjectsCount = Project::whereIn('status', ['To Do', 'In Progress'])->count();
            
            $tasksCount = Task::count();
            $completedTasksCount = Task::where('status', 'Completed')->count();
            $overdueTasksCount = Task::where('due_date', '<', Carbon::now())
                ->whereNotIn('status', ['Completed'])
                ->count();
            
        } else {
            // For members, only show projects and tasks they're assigned to
            $userTaskIds = Task::where('assigned_to', $user->id)->pluck('id');
            $userProjectIds = Task::where('assigned_to', $user->id)->pluck('project_id')->unique();
            
            $projectsCount = count($userProjectIds);
            $activeProjectsCount = Project::whereIn('id', $userProjectIds)
                ->whereIn('status', ['To Do', 'In Progress'])
                ->count();
            
            $tasksCount = count($userTaskIds);
            $completedTasksCount = Task::where('assigned_to', $user->id)
                ->where('status', 'Completed')
                ->count();
            $overdueTasksCount = Task::where('assigned_to', $user->id)
                ->where('due_date', '<', Carbon::now())
                ->whereNotIn('status', ['Completed'])
                ->count();
        }
        
        return response()->json([
            'projects' => [
                'total' => $projectsCount,
                'active' => $activeProjectsCount,
            ],
            'tasks' => [
                'total' => $tasksCount,
                'completed' => $completedTasksCount,
                'overdue' => $overdueTasksCount,
            ],
            'users' => [
                'total' => User::count(),
                'managers' => User::where('role', 'manager')->count(),
                'members' => User::where('role', 'member')->count(),
            ]
        ]);
    }
    
    public function getRecentProjects()
    {
        $user = Auth::user();
        
        // For managers, show all recent projects
        if ($user->role === 'manager') {
            $recentProjects = Project::with('manager:id,name')
                ->orderBy('updated_at', 'desc')
                ->take(5)
                ->get();
        } else {
            // For members, only show recent projects they're assigned to
            $userProjectIds = Task::where('assigned_to', $user->id)
                ->pluck('project_id')
                ->unique();
                
            $recentProjects = Project::with('manager:id,name')
                ->whereIn('id', $userProjectIds)
                ->orderBy('updated_at', 'desc')
                ->take(5)
                ->get();
        }
        
        return response()->json($recentProjects);
    }
    
    public function getUpcomingTasks()
    {
        $user = Auth::user();
        $today = Carbon::now();
        $nextWeek = Carbon::now()->addDays(7);
        
        // Base query for upcoming tasks (due within the next 7 days and not completed)
        $query = Task::with(['project:id,name', 'assignedTo:id,name'])
            ->whereBetween('due_date', [$today, $nextWeek])
            ->whereNotIn('status', ['Completed'])
            ->orderBy('due_date', 'asc');
            
        // For managers, show all upcoming tasks
        if ($user->role === 'manager') {
            $upcomingTasks = $query->take(5)->get();
        } else {
            // For members, only show upcoming tasks assigned to them
            $upcomingTasks = $query->where('assigned_to', $user->id)
                ->take(5)
                ->get();
        }
        
        // Format the response for the frontend
        $formattedTasks = $upcomingTasks->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'due_date' => $task->due_date,
                'priority' => strtolower($task->priority),
                'project_id' => $task->project_id,
                'project_title' => $task->project ? $task->project->name : 'Unknown Project'
            ];
        });
        
        return response()->json($formattedTasks);
    }
} 