<?php

namespace App\Http\Requests\Band;

use App\Http\Requests\Concerns\ValidatesInstruments;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInstrumentsRequest extends FormRequest
{
    use ValidatesInstruments;

    public function authorize(): bool
    {
        return $this->user()->can('view', $this->route('band'));
    }

    protected function prepareForValidation(): void
    {
        $this->trimInstruments();
    }

    public function rules(): array
    {
        return $this->instrumentRules();
    }
}
