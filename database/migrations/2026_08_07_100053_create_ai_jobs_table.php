<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['generate','edit','translate']);
            $table->text('prompt');
            $table->json('response_json')->nullable();
            $table->string('model');
            $table->integer('input_tokens')->nullable();
            $table->integer('output_tokens')->nullable();
            $table->integer('latency_ms')->nullable();
            $table->enum('status', ['pending','processing','completed','failed']);
            $table->text('error')->nullable();
            $table->timestamps();
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_jobs');
    }
};
