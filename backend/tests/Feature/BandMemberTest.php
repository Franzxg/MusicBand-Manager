<?php

namespace Tests\Feature;

use App\Models\Band;
use App\Models\Membership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BandMemberTest extends TestCase
{
    use RefreshDatabase;

    private function bandWith(User ...$users): Band
    {
        $band = Band::create(['name' => 'The Testers', 'invite_code' => Band::generateInviteCode()]);
        foreach ($users as $user) {
            Membership::create(['band_id' => $band->id, 'user_id' => $user->id])
                ->instruments()->create(['instrument' => 'Chitarra']);
        }

        return $band;
    }

    public function test_member_can_replace_own_instruments(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $band = $this->bandWith($user, $other);
        Sanctum::actingAs($user);

        $this->putJson("/api/bands/{$band->id}/me/instruments", ['instruments' => ['Pianoforte', 'Arpa']])
            ->assertOk()
            ->assertJsonPath('data.my_instruments', ['Pianoforte', 'Arpa']);

        // Gli strumenti degli altri membri non cambiano
        $otherMembership = Membership::where('user_id', $other->id)->first();
        $this->assertEquals(['Chitarra'], $otherMembership->instruments->pluck('instrument')->all());
    }

    public function test_instruments_cannot_be_empty_or_duplicated(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->putJson("/api/bands/{$band->id}/me/instruments", ['instruments' => []])
            ->assertUnprocessable()->assertJsonValidationErrors(['instruments']);
        $this->putJson("/api/bands/{$band->id}/me/instruments", ['instruments' => ['Voce', 'VOCE']])
            ->assertUnprocessable()->assertJsonValidationErrors(['instruments.0']);

        $this->assertDatabaseHas('member_instruments', ['instrument' => 'Chitarra']);
    }

    public function test_member_can_remove_another_member(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $band = $this->bandWith($user, $other);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/bands/{$band->id}/members/{$other->id}")->assertNoContent();

        $this->assertFalse($other->isMemberOf($band));
        $this->assertModelExists($band);
        $this->assertDatabaseCount('member_instruments', 1);
    }

    public function test_member_can_leave_band(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user, User::factory()->create());
        Sanctum::actingAs($user);

        $this->deleteJson("/api/bands/{$band->id}/members/{$user->id}")->assertNoContent();

        $this->assertFalse($user->isMemberOf($band));
        $this->assertModelExists($band);
    }

    public function test_band_is_deleted_when_last_member_leaves(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/bands/{$band->id}/members/{$user->id}")->assertNoContent();

        $this->assertModelMissing($band);
    }

    public function test_removing_a_non_member_returns_404(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $stranger = User::factory()->create();
        Sanctum::actingAs($user);

        $this->deleteJson("/api/bands/{$band->id}/members/{$stranger->id}")->assertNotFound();
    }

    public function test_non_member_cannot_remove_members(): void
    {
        $member = User::factory()->create();
        $band = $this->bandWith($member);
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/bands/{$band->id}/members/{$member->id}")->assertForbidden();

        $this->assertTrue($member->isMemberOf($band));
    }
}
