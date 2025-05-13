<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // This method checks if the current user can modify the task
    private function canModifyTask(Task $task)
    {
        $user = Auth::user();
        
        // If user is a manager, they can modify any task
        if ($user->role === 'manager') {
            return true;
        }
        
        // If user is a member, they can only modify tasks assigned to them
        return $user->id === $task->assigned_to;
    }

    public function index(Request $request)
    {
        $query = Task::with(['assignedTo:id,name', 'project:id,name']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        
        $tasks = $query->get();
        
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|in:To Do,In Progress,Under Review,Completed',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task = Task::create($request->all());
        $task->load(['assignedTo:id,name', 'project:id,name']);

        return response()->json($task, 201);
    }

    public function show(Task $task)
    {
        $task->load([
            'assignedTo:id,name', 
            'project:id,name', 
            'comments.user:id,name', 
            'timeEntries',
            'expenditures'
        ]);
        
        // Add computed attributes
        $task->total_expenditure = $task->totalExpenditure;
        
        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        // Check if the user has permission to update this task
        if (!$this->canModifyTask($task)) {
            return response()->json([
                'message' => 'You do not have permission to update this task. Only managers or the assigned member can update tasks.'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'sometimes|required|exists:projects,id',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'sometimes|required|in:To Do,In Progress,Under Review,Completed',
            'priority' => 'sometimes|required|in:Low,Medium,High,Urgent',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task->update($request->all());
        $task->load(['assignedTo:id,name', 'project:id,name']);

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        // Check if the user has permission to delete this task
        if (!$this->canModifyTask($task)) {
            return response()->json([
                'message' => 'You do not have permission to delete this task. Only managers or the assigned member can delete tasks.'
            ], 403);
        }
        
        $task->delete();
        return response()->json(null, 204);
    }

    public function getTasksByProject(Project $project)
    {
        $tasks = $project->tasks()->with('assignedTo:id,name')->get();
        return response()->json($tasks);
    }
    
}