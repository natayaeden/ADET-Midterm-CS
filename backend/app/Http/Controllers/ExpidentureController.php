<?php

namespace App\Http\Controllers;

use App\Models\Expenditure;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenditureController extends Controller
{
    public function index(Request $request)
    {
        $query = Expenditure::with('project:id,name');
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $expenditures = $query->get();
        
        return response()->json($expenditures);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'receipt' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expenditure = Expenditure::create($request->all());
        $expenditure->load('project:id,name');

        return response()->json($expenditure, 201);
    }

    public function show(Expenditure $expenditure)
    {
        $expenditure->load('project:id,name');
        return response()->json($expenditure);
    }

    public function update(Request $request, Expenditure $expenditure)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'sometimes|required|exists:projects,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'date' => 'sometimes|required|date',
            'receipt' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expenditure->update($request->all());
        $expenditure->load('project:id,name');

        return response()->json($expenditure);
    }

    public function destroy(Expenditure $expenditure)
    {
        $expenditure->delete();
        return response()->json(null, 204);
    }

    public function getExpendituresByProject(Project $project)
    {
        $expenditures = $project->expenditures()->get();
        return response()->json($expenditures);
    }
}