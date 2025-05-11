<?php

namespace App\Http\Controllers;

use App\Models\Risk;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RiskController extends Controller
{
    public function index(Project $project)
    {
        $risks = $project->risks()->with('assignedUser')->get();
        return response()->json($risks);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:low,medium,high,critical',
            'probability' => 'required|in:low,medium,high',
            'impact' => 'required|string',
            'mitigation_strategy' => 'nullable|string',
            'status' => 'required|in:open,in_progress,mitigated,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date'
        ]);

        $risk = $project->risks()->create($validated);
        return response()->json($risk, 201);
    }

    public function update(Request $request, Project $project, Risk $risk)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'severity' => 'in:low,medium,high,critical',
            'probability' => 'in:low,medium,high',
            'impact' => 'string',
            'mitigation_strategy' => 'nullable|string',
            'status' => 'in:open,in_progress,mitigated,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date'
        ]);

        $risk->update($validated);
        return response()->json($risk);
    }

    public function destroy(Project $project, Risk $risk)
    {
        $risk->delete();
        return response()->json(null, 204);
    }
} 