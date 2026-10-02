<?php

namespace App\Http\Requests\Band;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('band'));
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->name)) {
            $this->merge(['name' => trim($this->name)]);
        }
        if ($this->has('genre')) {
            $this->merge([
                'genre' => is_string($this->genre) && trim($this->genre) !== '' ? trim($this->genre) : null,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'genre' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }
}
