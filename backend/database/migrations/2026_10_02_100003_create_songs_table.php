<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('band_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->string('artist', 150);
            // NOT NULL con default '': con NULL il vincolo UNIQUE non bloccherebbe i duplicati
            $table->string('version', 100)->default('');
            $table->string('link', 500)->nullable();
            $table->unsignedInteger('duration_seconds');
            $table->string('musical_key', 10)->nullable();
            $table->unsignedTinyInteger('energy')->nullable();
            $table->unsignedSmallInteger('bpm')->nullable();
            $table->enum('status', ['to_study', 'studying', 'completed'])->default('to_study');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['band_id', 'title', 'artist', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
