<?php

namespace App\Http\Requests\Setlist;

use App\Models\Live;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Copia la scaletta da un altro live della stessa band
class CopySetlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('live'));
    }

    public function rules(): array
    {
        return [
            'source_live_id' => ['required', 'integer', 'exists:lives,id'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                $target = $this->route('live');
                $source = $this->sourceLive();
                if ($source->id === $target->id) {
                    $validator->errors()->add('source_live_id', __('setlist.same_live'));
                } elseif ($source->band_id !== $target->band_id) {
                    $validator->errors()->add('source_live_id', __('setlist.other_band'));
                }
            },
        ];
    }

    public function sourceLive(): Live
    {
        return Live::findOrFail($this->input('source_live_id'));
    }
}
