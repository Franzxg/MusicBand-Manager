<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Elenco di live o prove di una band, dalla data `from` (default: adesso)
class ListEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('view', $this->route('band'));
    }

    public function rules(): array
    {
        return [
            'from' => ['nullable', 'date'],
        ];
    }
}
