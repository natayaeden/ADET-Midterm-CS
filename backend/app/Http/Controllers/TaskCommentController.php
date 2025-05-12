<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    public function store(Request $request, $taskId)
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:255',
            'file' => 'nullable|file|max:5120',
        ]);

        $data = [
            'task_id' => $taskId,
            'user_id' => Auth::id(),
            'comment' => $validated['comment'],
        ];

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('comment_files', 'public');
            $data['file_path'] = $path;
            $data['file_name'] = $file->getClientOriginalName();
        }

        $comment = TaskComment::create($data);

        // Return the newly created comment with user data
        return response()->json($comment->load('user'), 201);
    }

    public function getCommentsByTask(Task $task)
    {
        return response()->json($task->comments()->with('user')->get());
    }

    public function destroy(TaskComment $taskComment)
    {
        $user = Auth::user();
        // Only allow the comment owner, project manager, or assignee to delete
        if ($user->id !== $taskComment->user_id && $user->role !== 'manager' && $user->id !== $taskComment->task->assigned_to) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $taskComment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
