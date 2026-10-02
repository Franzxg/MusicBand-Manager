<?php

namespace App\Http\Requests\Band;

use App\Http\Requests\Concerns\ValidatesInstruments;
use App\Models\Band;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class JoinBandRequest extends FormRequest
{
    use ValidatesInstruments;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->invite_code)) {
            $this->merge(['invite_code' => strtoupper(trim($this->invite_code))]);
        }
        $this->trimInstruments();
    }

    public function rules(): array
    {
        return [
            'invite_code' => ['required', 'string', 'size:8', 'exists:bands,invite_code'],
            ...$this->instrumentRules(),
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $band = $this->band();
                if ($band && $this->user()->isMemberOf($band)) {
                    $validator->errors()->add('invite_code', __('bands.already_member'));
                }
            },
        ];
    }

    public function band(): ?Band
    {
        return Band::firstWhere('invite_code', $this->input('invite_code'));
    }
}
