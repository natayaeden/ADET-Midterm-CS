<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'message', 
        'type',
        'related_id',
        'is_read',
        'data'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
