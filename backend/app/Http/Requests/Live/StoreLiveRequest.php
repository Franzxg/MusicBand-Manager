<?php

namespace App\Http\Requests\Live;

use App\Http\Requests\Concerns\ValidatesEventFields;
use Illuminate\Foundation\Http\FormRequest;

class StoreLiveRequest extends FormRequest
{
    use ValidatesEventFields;

    public function authorize(): bool
    {
        return $this->user()->can('view', $this->route('band'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimPlace();
    }

    public function rules(): array
    {
        return [
            ...$this->eventRules(),
            'setlist_notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
