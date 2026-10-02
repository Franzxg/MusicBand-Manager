<?php

namespace App\Http\Requests\Concerns;

// Regole comuni per l'elenco degli strumenti di un membro
trait ValidatesInstruments
{
    protected function trimInstruments(): void
    {
        if (is_array($this->instruments)) {
            $this->merge([
                'instruments' => array_map(
                    fn ($instrument) => is_string($instrument) ? trim($instrument) : $instrument,
                    $this->instruments
                ),
            ]);
        }
    }

    protected function instrumentRules(): array
    {
        return [
            'instruments' => ['required', 'array', 'min:1', 'max:10'],
            'instruments.*' => ['required', 'string', 'min:1', 'max:50', 'distinct:ignore_case'],
        ];
    }
}
