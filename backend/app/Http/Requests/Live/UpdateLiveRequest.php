<?php

namespace App\Http\Requests\Live;

use App\Http\Requests\Concerns\ValidatesEventFields;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLiveRequest extends FormRequest
{
    use ValidatesEventFields;

    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('live'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimPlace();
    }

    public function rules(): array
    {
        return [
            ...$this->eventRules(partial: true),
            'setlist_notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ];
    }
}
