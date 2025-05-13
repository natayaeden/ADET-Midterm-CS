<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Get query parameters
        $role = $request->query('role');
        
        // Start with base query
        $query = User::select('id', 'name', 'email', 'role');
        
        // Filter by role if provided
        if ($role && in_array($role, ['manager', 'member'])) {
            $query->where('role', $role);
        }
        
        $users = $query->get();
        
        return response()->json($users);
    }
    
    /**
     * Store a newly created user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['manager', 'member'])],
        ]);
        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);
        
        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->only('id', 'name', 'email', 'role'),
        ], 201);
    }
    
    /**
     * Display the specified user.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        
        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'role'),
        ]);
    }
    
    /**
     * Update the specified user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => ['sometimes', Rule::in(['manager', 'member'])],
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->only('id', 'name', 'email', 'role'),
        ]);
    }
    
    /**
     * Remove the specified user from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
    
    /**
     * Get projects where the authenticated user has assigned tasks.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserProjects(Request $request)
    {
        $user = $request->user();
        
        // If user is a manager, return all their projects
        if ($user->role === 'manager') {
            $projects = Project::where('user_id', $user->id)->with('manager:id,name')->get();
            return response()->json($projects);
        }
        
        // For members, only return projects where they have assigned tasks
        $assignedTasksProjects = Task::where('assigned_to', $user->id)
            ->pluck('project_id')
            ->unique();
        
        $projects = Project::whereIn('id', $assignedTasksProjects)
            ->with('manager:id,name')
            ->get();
        
        return response()->json($projects);
    }
    
    /**
     * Get managers only.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function managers()
    {
        $managers = User::where('role', 'manager')
            ->select('id', 'name', 'email', 'role')
            ->get();
            
        return response()->json($managers);
    }
    
    /**
     * Get members only.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function members()
    {
        $members = User::where('role', 'member')
            ->select('id', 'name', 'email', 'role')
            ->get();
            
        return response()->json($members);
    }
}