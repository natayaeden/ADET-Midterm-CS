<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
<<<<<<< HEAD
        'name',
        'description',
        'user_id',
        'budget',
        'status',
        'start_date',
        'due_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'budget' => 'decimal:2',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'user_id');
=======
        'user_id',
        'name',
        'description',
        'project_manager',
        'timeline',
        'project_budget',
        'status',
        'due_date'
    ];

    protected $casts = [
        'due_date' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
>>>>>>> main
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
<<<<<<< HEAD

    public function expenditures()
    {
        return $this->hasMany(Expenditure::class);
    }

    public function getTotalExpenditureAttribute()
    {
        return $this->expenditures->sum('amount');
    }

    public function getBudgetRemainingAttribute()
    {
        return $this->budget - $this->total_expenditure;
    }
=======
>>>>>>> main
}
