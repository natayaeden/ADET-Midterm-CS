<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index()
    {
        try {
            $projects = Project::where('user_id', Auth::id())->get();
            return response()->json(['projects' => $projects], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching projects', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'status' => 'required|in:Not Started,In Progress,Completed',
                'due_date' => 'required|date'
            ]);

            $project = Project::create([
                'user_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'status' => $validated['status'],
                'due_date' => $validated['due_date']
            ]);

            return response()->json(['message' => 'Project created successfully', 'project' => $project], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating project', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($id);
            return response()->json(['project' => $project], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Project not found', 'error' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($id);

            $validated = $request->validate([
                'name' => 'string|max:255',
                'description' => 'string',
                'status' => 'in:Not Started,In Progress,Completed',
                'due_date' => 'date'
            ]);

            $project->update($validated);

            return response()->json(['message' => 'Project updated successfully', 'project' => $project], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating project', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $project = Project::where('user_id', Auth::id())->findOrFail($id);
            $project->delete();

            return response()->json(['message' => 'Project deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting project', 'error' => $e->getMessage()], 500);
        }
    }
}
