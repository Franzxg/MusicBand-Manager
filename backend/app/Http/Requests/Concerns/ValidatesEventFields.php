<?php

namespace App\Http\Requests\Concerns;

// Regole comuni per live e prove (luogo, data e ora, note)
trait ValidatesEventFields
{
    protected function trimPlace(): void
    {
        if (is_string($this->input('place'))) {
            $this->merge(['place' => trim($this->input('place'))]);
        }
    }

    protected function eventRules(bool $partial = false): array
    {
        $required = $partial ? ['sometimes', 'required'] : ['required'];
        $optional = $partial ? ['sometimes', 'nullable'] : ['nullable'];

        return [
            'place' => [...$required, 'string', 'max:150'],
            'starts_at' => [...$required, 'date'],
            'notes' => [...$optional, 'string', 'max:10000'],
        ];
    }
}
