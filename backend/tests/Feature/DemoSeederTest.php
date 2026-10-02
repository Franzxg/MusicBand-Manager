<?php

namespace Tests\Feature;

use App\Models\Live;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_demo_data(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('bands', 2);
        $this->assertDatabaseCount('songs', 15);
        $this->assertDatabaseCount('lives', 2);
        $this->assertDatabaseCount('rehearsals', 3);
        $this->assertDatabaseCount('live_song', 6);

        $demo1 = User::firstWhere('email', 'demo1@example.com');
        $demo2 = User::firstWhere('email', 'demo2@example.com');
        $this->assertCount(2, $demo1->bands);
        $this->assertCount(1, $demo2->bands);

        // Eventi tutti futuri, così il calendario non è vuoto
        $this->assertEquals(0, Live::where('starts_at', '<', now())->count());

        $this->postJson('/api/login', ['email' => 'demo1@example.com', 'password' => 'password123'])->assertOk();
    }
}
