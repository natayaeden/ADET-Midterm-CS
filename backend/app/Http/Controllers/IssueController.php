<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IssueController extends Controller
{
    public function index(Project $project)
    {
        $issues = $project->issues()->with(['assignedUser', 'reporter'])->get();
        return response()->json($issues);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:open,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'resolution_notes' => 'nullable|string'
        ]);

        $validated['reported_by'] = Auth::id();
        $issue = $project->issues()->create($validated);
        return response()->json($issue, 201);
    }

    public function update(Request $request, Project $project, Issue $issue)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'priority' => 'in:low,medium,high,urgent',
            'status' => 'in:open,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'resolution_notes' => 'nullable|string'
        ]);

        $issue->update($validated);
        return response()->json($issue);
    }

    public function destroy(Project $project, Issue $issue)
    {
        $issue->delete();
        return response()->json(null, 204);
    }
} 