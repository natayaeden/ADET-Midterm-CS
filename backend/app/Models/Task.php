<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', //check first if this is must be fillable
        'title',
        'description',
        'assigned_to',
        'task_budget',
        'start_date',
        'end_date',
        'due_date',
        'priority',
        'status'
    ];

    protected $casts = [
        'due_date' => 'datetime'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function calculateProgress()
    {
        if (!$this->start_date || !$this->end_date) {
            return 0;
        }

        $start = strtotime($this->start_date);
        $end = strtotime($this->end_date);
        $now = strtotime('today');

        if ($now <= $start) {
            return 0;
        }

        if ($now >= $end) {
            return 100;
        }

        $totalDays = $end - $start;
        $elapsedDays = $now - $start;

        return round(($elapsedDays / $totalDays) * 100);
    }
}
