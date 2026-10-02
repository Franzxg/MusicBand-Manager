<?php

namespace App\Http\Requests\Song;

use App\Http\Requests\Concerns\ValidatesSongFields;
use App\Models\Song;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSongRequest extends FormRequest
{
    use ValidatesSongFields;

    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('song'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimSongFields();
    }

    public function rules(): array
    {
        return $this->songRules(partial: true);
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                // Controlla la chiave unica con i valori nuovi o quelli attuali
                $song = $this->route('song');
                $duplicate = Song::findDuplicate(
                    $song->band_id,
                    $this->input('title', $song->title),
                    $this->input('artist', $song->artist),
                    $this->input('version', $song->version),
                    $song->id,
                );
                if ($duplicate) {
                    $validator->errors()->add('title', __('setlist.duplicate_song'));
                }
            },
        ];
    }
}
