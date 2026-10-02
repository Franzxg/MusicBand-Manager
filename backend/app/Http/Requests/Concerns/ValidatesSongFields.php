<?php

namespace App\Http\Requests\Concerns;

use App\Models\Song;
use Illuminate\Validation\Rule;

// Regole comuni per i dati di una canzone (repertorio e brano nuovo in scaletta)
trait ValidatesSongFields
{
    protected function trimSongFields(): void
    {
        foreach (['title', 'artist', 'version', 'link', 'musical_key'] as $field) {
            if (is_string($this->input($field))) {
                $this->merge([$field => trim($this->input($field))]);
            }
        }
        // Versione assente o vuota = stringa vuota (fa parte della chiave unica)
        if ($this->exists('version') && ($this->input('version') === null)) {
            $this->merge(['version' => '']);
        }
        foreach (['link', 'musical_key'] as $field) {
            if ($this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }
    }

    protected function songRules(bool $partial = false): array
    {
        $required = $partial ? ['sometimes', 'required'] : ['required'];
        $optional = $partial ? ['sometimes', 'nullable'] : ['nullable'];

        return [
            'title' => [...$required, 'string', 'max:150'],
            'artist' => [...$required, 'string', 'max:150'],
            'duration_seconds' => [...$required, 'integer', 'between:1,7200'],
            'version' => [...$optional, 'string', 'max:100'],
            'link' => [...$optional, 'string', 'max:500', 'url:http,https'],
            'musical_key' => [...$optional, 'string', 'max:10'],
            'energy' => [...$optional, 'integer', 'between:1,5'],
            'bpm' => [...$optional, 'integer', 'between:30,300'],
            'status' => ['sometimes', 'required', Rule::in(Song::STATUSES)],
            'notes' => [...$optional, 'string', 'max:10000'],
        ];
    }
}
