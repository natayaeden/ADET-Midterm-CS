<?php

namespace App\Http\Controllers;

use App\Models\Risk;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RiskController extends Controller
{
    public function index(Request $request)
    {
        $query = Risk::with(['project', 'assignedUser']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:risk,issue',
            'severity' => 'required|in:low,medium,high,critical',
            'status' => 'required|in:open,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'resolution' => 'nullable|string',
        ]);

        $risk = Risk::create($validated);
        return response()->json($risk->load(['project', 'assignedUser']), 201);
    }

    public function show(Risk $risk)
    {
        return response()->json($risk->load(['project', 'assignedUser']));
    }

    public function update(Request $request, Risk $risk)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:risk,issue',
            'severity' => 'sometimes|required|in:low,medium,high,critical',
            'status' => 'sometimes|required|in:open,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'resolution' => 'nullable|string',
        ]);

        $risk->update($validated);
        return response()->json($risk->load(['project', 'assignedUser']));
    }

    public function destroy(Risk $risk)
    {
        $risk->delete();
        return response()->json(null, 204);
    }

    public function getProjectStatistics(Project $project)
    {
        $risks = $project->risks;
        
        $statistics = [
            'total' => $risks->count(),
            'by_type' => [
                'risk' => $risks->where('type', 'risk')->count(),
                'issue' => $risks->where('type', 'issue')->count(),
            ],
            'by_severity' => [
                'low' => $risks->where('severity', 'low')->count(),
                'medium' => $risks->where('severity', 'medium')->count(),
                'high' => $risks->where('severity', 'high')->count(),
                'critical' => $risks->where('severity', 'critical')->count(),
            ],
            'by_status' => [
                'open' => $risks->where('status', 'open')->count(),
                'in_progress' => $risks->where('status', 'in_progress')->count(),
                'resolved' => $risks->where('status', 'resolved')->count(),
                'closed' => $risks->where('status', 'closed')->count(),
            ],
        ];

        return response()->json($statistics);
    }
} 