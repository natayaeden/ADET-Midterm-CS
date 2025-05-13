<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskExpenditure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TaskExpenditureController extends Controller
{
    /**
     * Check if the current user can modify expenditures for a task
     */
    private function canModifyTaskExpenditures($taskId)
    {
        $user = Auth::user();
        $task = Task::find($taskId);
        
        if (!$task) {
            return false;
        }
        
        // If user is a manager, they can modify any task expenditures
        if ($user->role === 'manager') {
            return true;
        }
        
        // If user is a member, they can only modify expenditures for tasks assigned to them
        return $user->id === $task->assigned_to;
    }

    /**
     * Get all expenditures for a specific task.
     */
    public function getExpendituresByTask(Task $task)
    {
        return response()->json($task->expenditures()->orderBy('date', 'desc')->get());
    }

    /**
     * Store a new task expenditure.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'task_id' => 'required|exists:tasks,id',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'receipt' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if the user has permission to add expenditures to this task
        if (!$this->canModifyTaskExpenditures($request->task_id)) {
            return response()->json([
                'message' => 'You do not have permission to add expenditures to this task. Only managers or the assigned member can add expenditures.'
            ], 403);
        }

        $data = $validator->validated();
        
        // Handle file upload if receipt is provided
        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $data['receipt_path'] = $path;
        }

        $expenditure = TaskExpenditure::create($data);
        
        return response()->json($expenditure, 201);
    }

    /**
     * Get a specific task expenditure.
     */
    public function show(TaskExpenditure $taskExpenditure)
    {
        return response()->json($taskExpenditure);
    }

    /**
     * Update a task expenditure.
     */
    public function update(Request $request, TaskExpenditure $taskExpenditure)
    {
        // Check if the user has permission to update expenditures for this task
        if (!$this->canModifyTaskExpenditures($taskExpenditure->task_id)) {
            return response()->json([
                'message' => 'You do not have permission to update expenditures for this task. Only managers or the assigned member can update expenditures.'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'description' => 'sometimes|required|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'date' => 'sometimes|required|date',
            'receipt' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Handle file upload if receipt is provided
        if ($request->hasFile('receipt')) {
            // Remove old receipt if exists
            if ($taskExpenditure->receipt_path) {
                Storage::disk('public')->delete($taskExpenditure->receipt_path);
            }
            
            $path = $request->file('receipt')->store('receipts', 'public');
            $data['receipt_path'] = $path;
        }

        $taskExpenditure->update($data);
        
        return response()->json($taskExpenditure);
    }

    /**
     * Delete a task expenditure.
     */
    public function destroy(TaskExpenditure $taskExpenditure)
    {
        // Check if the user has permission to delete expenditures for this task
        if (!$this->canModifyTaskExpenditures($taskExpenditure->task_id)) {
            return response()->json([
                'message' => 'You do not have permission to delete expenditures for this task. Only managers or the assigned member can delete expenditures.'
            ], 403);
        }
        
        // Remove receipt file if exists
        if ($taskExpenditure->receipt_path) {
            Storage::disk('public')->delete($taskExpenditure->receipt_path);
        }
        
        $taskExpenditure->delete();
        
        return response()->json(null, 204);
    }
} 