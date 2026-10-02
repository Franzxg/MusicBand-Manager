<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('band_id')->constrained()->cascadeOnDelete();
            $table->string('place', 150);
            $table->dateTime('starts_at');
            $table->text('notes')->nullable();
            $table->text('setlist_notes')->nullable();
            $table->timestamps();

            $table->index(['band_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lives');
    }
};
