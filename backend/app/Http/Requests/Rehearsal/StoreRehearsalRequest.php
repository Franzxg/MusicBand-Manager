<?php

namespace App\Http\Requests\Rehearsal;

use App\Http\Requests\Concerns\ValidatesEventFields;
use Illuminate\Foundation\Http\FormRequest;

class StoreRehearsalRequest extends FormRequest
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
        return $this->eventRules();
    }
}
