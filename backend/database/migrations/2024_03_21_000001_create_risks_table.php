<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->enum('probability', ['low', 'medium', 'high']);
            $table->text('impact');
            $table->text('mitigation_strategy')->nullable();
            $table->enum('status', ['open', 'in_progress', 'mitigated', 'closed']);
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamp('due_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('risks');
    }
}; 