<?php

namespace App\Http\Requests\Rehearsal;

use App\Http\Requests\Concerns\ValidatesEventFields;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRehearsalRequest extends FormRequest
{
    use ValidatesEventFields;

    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('rehearsal'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimPlace();
    }

    public function rules(): array
    {
        return $this->eventRules(partial: true);
    }
}
