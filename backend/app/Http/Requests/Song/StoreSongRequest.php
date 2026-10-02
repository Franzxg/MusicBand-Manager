<?php

namespace App\Http\Requests\Song;

use App\Http\Requests\Concerns\ValidatesSongFields;
use App\Models\Song;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreSongRequest extends FormRequest
{
    use ValidatesSongFields;

    public function authorize(): bool
    {
        return $this->user()->can('view', $this->route('band'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimSongFields();
    }

    public function rules(): array
    {
        return $this->songRules();
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                $duplicate = Song::findDuplicate(
                    $this->route('band')->id,
                    $this->input('title'),
                    $this->input('artist'),
                    $this->input('version', ''),
                );
                if ($duplicate) {
                    $validator->errors()->add('title', __('setlist.duplicate_song'));
                }
            },
        ];
    }
}
