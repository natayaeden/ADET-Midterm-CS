<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index($projectId)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($projectId);
            $tasks = Task::where('project_id', $projectId)->get();
            return response()->json(['tasks' => $tasks], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching tasks', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request, $projectId)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($projectId);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'priority' => 'required|in:High,Medium,Low',
                'status' => 'required|in:To Do,In Progress,Done',
                'due_date' => 'required|date'
            ]);

            $task = Task::create([
                'project_id' => $projectId,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'due_date' => $validated['due_date']
            ]);

            return response()->json(['message' => 'Task created successfully', 'task' => $task], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating task', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($projectId, $id)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($projectId);
            $task = Task::where('project_id', $projectId)->findOrFail($id);
            return response()->json(['task' => $task], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Task not found', 'error' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, $projectId, $id)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($projectId);
            $task = Task::where('project_id', $projectId)->findOrFail($id);

            $validated = $request->validate([
                'title' => 'string|max:255',
                'description' => 'string',
                'priority' => 'in:High,Medium,Low',
                'status' => 'in:To Do,In Progress,Done',
                'due_date' => 'date'
            ]);

            $task->update($validated);

            return response()->json(['message' => 'Task updated successfully', 'task' => $task], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating task', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($projectId, $id)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($projectId);
            $task = Task::where('project_id', $projectId)->findOrFail($id);
            $task->delete();

            return response()->json(['message' => 'Task deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting task', 'error' => $e->getMessage()], 500);
        }
    }
}
