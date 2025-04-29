<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expenditure;
use Illuminate\Support\Facades\Validator;

class ExpenditureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $expenditures = Expidenture::all();
        return response()->json($expenditures);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expenditure = Expidenture::create($request->all());
        return response()->json($expenditure, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $expenditure = Expidenture::findOrFail($id);
        return response()->json($expenditure);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $expenditure = Expidenture::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'project_id' => 'sometimes|required|exists:projects,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'sometimes|required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expenditure->update($request->all());
        return response()->json($expenditure);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $expenditure = Expidenture::findOrFail($id);
        $expenditure->delete();
        return response()->json(null, 204);
    }
}
