<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_instruments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('band_user_id')->constrained('band_user')->cascadeOnDelete();
            $table->string('instrument', 50);
            $table->timestamps();

            $table->unique(['band_user_id', 'instrument']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_instruments');
    }
};
