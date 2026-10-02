<?php

namespace App\Http\Requests\Chat;

use App\Models\Live;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Conversazione inviata dal frontend (il backend non ne conserva copia)
class ChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('view', $this->route('band'));
    }

    public function rules(): array
    {
        return [
            'messages' => ['required', 'array', 'min:1', 'max:10'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:2000'],
            'live_id' => ['nullable', 'integer', 'exists:lives,id'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                $messages = $this->input('messages');
                if (end($messages)['role'] !== 'user') {
                    $validator->errors()->add('messages', __('ai.last_message_user'));
                }
                $live = $this->live();
                if ($live && $live->band_id !== $this->route('band')->id) {
                    $validator->errors()->add('live_id', __('ai.live_other_band'));
                }
            },
        ];
    }

    // Solo role e content: altri campi inviati dal client vengono ignorati
    public function conversation(): array
    {
        return array_map(
            fn ($message) => ['role' => $message['role'], 'content' => $message['content']],
            array_values($this->validated('messages')),
        );
    }

    public function live(): ?Live
    {
        return $this->filled('live_id') ? Live::find($this->input('live_id')) : null;
    }
}
