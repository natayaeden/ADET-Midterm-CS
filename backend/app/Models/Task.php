<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'project_id',
        'assigned_to',
        'status',
        'priority',
        'due_date',
        'estimated_hours',
        'budget',
    ];

    protected $casts = [
        'due_date' => 'date',
        'budget' => 'decimal:2',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function timeEntries()
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    public function expenditures()
    {
        return $this->hasMany(TaskExpenditure::class);
    }

    public function getTotalTimeSpentAttribute()
    {
        return $this->timeEntries->sum('hours');
    }

    public function getTotalExpenditureAttribute()
    {
        return $this->expenditures->sum('amount');
    }
}
