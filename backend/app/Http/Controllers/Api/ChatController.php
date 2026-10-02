<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\ChatRequest;
use App\Models\Band;
use App\Services\Ai\AiChatService;
use App\Services\Ai\LlmUnavailableException;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function __invoke(ChatRequest $request, Band $band, AiChatService $chat): JsonResponse
    {
        try {
            $result = $chat->reply($band, $request->conversation(), $request->live());
        } catch (LlmUnavailableException) {
            return response()->json(['message' => __('ai.unavailable')], 503);
        }

        return response()->json($result);
    }
}
