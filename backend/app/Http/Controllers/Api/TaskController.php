<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'task_budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:High,Medium,Low',
            'status' => 'required|in:Not Started,In Progress,On Hold,Completed,Cancelled',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $validated['project_id'] = $projectId;
        $task = Task::create($validated);
        
        // Calculate progress
        $task->progress = $task->calculateProgress();
        
        return response()->json($task, 201);
    }

    public function update(Request $request, $projectId, $id)
    {
        $task = Task::where('project_id', $projectId)->findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'task_budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|required|in:High,Medium,Low',
            'status' => 'sometimes|required|in:Not Started,In Progress,On Hold,Completed,Cancelled',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        $task->update($validated);
        
        // Calculate progress
        $task->progress = $task->calculateProgress();
        
        return response()->json($task);
    }

    public function show($projectId, $id)
    {
        $task = Task::where('project_id', $projectId)
            ->with(['project', 'assignedUser'])
            ->findOrFail($id);
            
        // Calculate progress
        $task->progress = $task->calculateProgress();
        
        return response()->json($task);
    }
} 