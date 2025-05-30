<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\ExpenditureController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskExpenditureController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/projects/recent', [DashboardController::class, 'getRecentProjects']);
    Route::get('/tasks/upcoming', [DashboardController::class, 'getUpcomingTasks']);

    // User routes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user-projects', [UserController::class, 'getUserProjects']);
    
    // Project routes
    Route::apiResource('projects', ProjectController::class);
    Route::get('/project-managers', [ProjectController::class, 'getProjectManagers']);
    Route::get('/projects/{project}/statistics', [ProjectController::class, 'statistics']);
    Route::post('/projects/{id}/files', [ProjectController::class, 'uploadFile']);
    Route::get('/projects/{id}/files', [ProjectController::class, 'getFiles']);
    
    // Task routes
    Route::apiResource('tasks', TaskController::class);
    Route::get('/projects/{project}/tasks', [TaskController::class, 'getTasksByProject']);
    
    // Time entry routes
    Route::apiResource('time-entries', TimeEntryController::class);
    Route::get('/tasks/{task}/time-entries', [TimeEntryController::class, 'getTimeEntriesByTask']);
    
    // Project Expenditure routes
    // Route::apiResource('expenditures', ExpenditureController::class);
    // Route::get('/projects/{project}/expenditures', [ExpenditureController::class, 'getExpendituresByProject']);
    
    // Task Expenditure routes
    Route::apiResource('task-expenditures', TaskExpenditureController::class);
    Route::get('/tasks/{task}/expenditures', [TaskExpenditureController::class, 'getExpendituresByTask']);
    
    // Comment routes
    Route::apiResource('task-comments', TaskCommentController::class);
    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'getCommentsByTask']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);

    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
