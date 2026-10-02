<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CalendarRequest;
use App\Http\Resources\CalendarEventResource;
use App\Models\Live;
use App\Models\Rehearsal;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;

class CalendarController extends Controller
{
    // Live e prove di tutte le band dell'utente nell'intervallo [from, to]
    public function __invoke(CalendarRequest $request): AnonymousResourceCollection
    {
        $range = [
            Carbon::parse($request->validated('from'))->utc(),
            Carbon::parse($request->validated('to'))->utc(),
        ];
        $bandIds = $request->user()->bands()->pluck('bands.id');

        $lives = Live::with('band')->whereIn('band_id', $bandIds)->whereBetween('starts_at', $range)->get();
        $rehearsals = Rehearsal::with('band')->whereIn('band_id', $bandIds)->whereBetween('starts_at', $range)->get();

        $events = $lives->toBase()->merge($rehearsals)->sortBy('starts_at')->values();

        return CalendarEventResource::collection($events);
    }
}
