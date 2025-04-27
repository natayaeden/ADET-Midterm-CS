<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // ✅ REGISTER FUNCTION
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    // ✅ LOGIN FUNCTION
    public function login(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            // Find user by username
            $user = User::where('username', $request->username)->first();

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Check password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Incorrect password'], 401);
            }

            // ✅ Generate API token (Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ✅ LOGOUT FUNCTION
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully'], 200);
    }
}
