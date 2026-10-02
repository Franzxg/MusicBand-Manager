<?php

namespace App\Http\Requests\Setlist;

use App\Http\Requests\Concerns\ValidatesSongFields;
use App\Models\Song;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Aggiunta in scaletta: brano del repertorio (song_id) oppure dati di un brano nuovo
class AddLiveSongRequest extends FormRequest
{
    use ValidatesSongFields;

    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('live'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimSongFields();
    }

    public function rules(): array
    {
        if ($this->filled('song_id')) {
            return ['song_id' => ['required', 'integer']];
        }

        return $this->songRules();
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty() || ! $this->filled('song_id')) {
                    return;
                }
                $song = Song::find($this->input('song_id'));
                if (! $song || $song->band_id !== $this->route('live')->band_id) {
                    $validator->errors()->add('song_id', __('setlist.wrong_band'));
                }
            },
        ];
    }
}
