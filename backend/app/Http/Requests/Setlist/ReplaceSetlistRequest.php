<?php

namespace App\Http\Requests\Setlist;

use App\Models\Song;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Sostituzione della scaletta (es. proposta della chat AI): solo brani della band
class ReplaceSetlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('live'));
    }

    public function rules(): array
    {
        return [
            'song_ids' => ['present', 'array'],
            'song_ids.*' => ['integer', 'distinct'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                $ids = $this->input('song_ids');
                $found = Song::whereIn('id', $ids)->where('band_id', $this->route('live')->band_id)->count();
                if ($found !== count($ids)) {
                    $validator->errors()->add('song_ids', __('setlist.wrong_band'));
                }
            },
        ];
    }
}
