<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\ProjectFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with('manager:id,name')->get();
        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'budget' => 'required|numeric|min:0',
            'status' => 'required|in:To Do,In Progress,Completed',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:start_date',
            'completed_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = Project::create($request->all());
        $project->load('manager:id,name');

        return response()->json($project, 201);
    }

    public function show(Project $project)
    {
        $project->load('manager:id,name');
        return response()->json($project);
    }

    public function update(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'user_id' => 'sometimes|required|exists:users,id',
            'budget' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:To Do,In Progress,Completed',
            'start_date' => 'sometimes|required|date',
            'due_date' => 'sometimes|required|date|after_or_equal:start_date',
            'completed_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project->update($request->all());
        $project->load('manager:id,name');

        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(null, 204);
    }

    public function getProjectManagers()
    {
        $users = User::select('id', 'name')->get();
        return response()->json($users);
    }

    public function statistics(Project $project)
    {
        $totalTasks = $project->tasks()->count();
        $completedTasks = $project->tasks()->where('status', 'Completed')->count();
        $totalExpenditure = $project->total_expenditure;
        $budgetRemaining = $project->budget_remaining;
        
        return response()->json([
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'completion_percentage' => $totalTasks > 0 ? ($completedTasks / $totalTasks * 100) : 0,
            'total_expenditure' => $totalExpenditure,
            'budget_remaining' => $budgetRemaining,
            'budget_utilization_percentage' => $project->budget > 0 ? ($totalExpenditure / $project->budget * 100) : 0,
        ]);
    }

    public function uploadFile(Request $request, $projectId)
    {
        $request->validate([
            'file' => 'required|file|max:2048',
        ]);

        $file = $request->file('file');
        $path = $file->store('project_files', 'public');

        $projectFile = ProjectFile::create([
            'project_id' => $projectId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
        ]);

        return response()->json($projectFile, 201);
    }

    public function getFiles($projectId)
    {
        $files = ProjectFile::where('project_id', $projectId)->get();
        return response()->json($files);
    }

    public function getBudgetReport(Project $project)
    {
        $plannedBudget = $project->budget;
        $spentBudget = $project->total_expenditure;
        $remainingBudget = $plannedBudget - $spentBudget;

        return response()->json([
            'planned_budget' => $plannedBudget,
            'spent_budget' => $spentBudget,
            'remaining_budget' => $remainingBudget,
            'budget_utilization' => $plannedBudget > 0 ? ($spentBudget / $plannedBudget) * 100 : 0,
        ]);
    }

    public function getProgressReport(Project $project)
    {
        $totalTasks = $project->tasks()->count();
        $completedTasks = $project->tasks()->where('status', 'completed')->count();
        $inProgressTasks = $project->tasks()->where('status', 'in_progress')->count();
        $notStartedTasks = $project->tasks()->where('status', 'not_started')->count();

        $totalRisks = $project->risks()->count();
        $openRisks = $project->risks()->where('status', 'open')->count();
        $mitigatedRisks = $project->risks()->where('status', 'mitigated')->count();

        $totalIssues = $project->issues()->count();
        $openIssues = $project->issues()->where('status', 'open')->count();
        $resolvedIssues = $project->issues()->where('status', 'resolved')->count();

        return response()->json([
            'tasks' => [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'in_progress' => $inProgressTasks,
                'not_started' => $notStartedTasks,
                'completion_percentage' => $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0,
            ],
            'risks' => [
                'total' => $totalRisks,
                'open' => $openRisks,
                'mitigated' => $mitigatedRisks,
            ],
            'issues' => [
                'total' => $totalIssues,
                'open' => $openIssues,
                'resolved' => $resolvedIssues,
            ],
        ]);
    }
}