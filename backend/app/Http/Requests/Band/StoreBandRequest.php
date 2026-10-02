<?php

namespace App\Http\Requests\Band;

use App\Http\Requests\Concerns\ValidatesInstruments;
use Illuminate\Foundation\Http\FormRequest;

class StoreBandRequest extends FormRequest
{
    use ValidatesInstruments;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name) ? trim($this->name) : $this->name,
            'genre' => is_string($this->genre) && trim($this->genre) !== '' ? trim($this->genre) : null,
        ]);
        $this->trimInstruments();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'genre' => ['nullable', 'string', 'max:50'],
            ...$this->instrumentRules(),
        ];
    }
}
