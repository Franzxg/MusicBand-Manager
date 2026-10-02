<?php

namespace App\Http\Requests\Setlist;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Nuovo ordine della scaletta: deve contenere tutti e soli i brani presenti
class ReorderSetlistRequest extends FormRequest
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
                $current = $this->route('live')->songs()->pluck('songs.id')->sort()->values()->all();
                $given = collect($this->input('song_ids'))->map(fn ($id) => (int) $id)->sort()->values()->all();
                if ($current !== $given) {
                    $validator->errors()->add('song_ids', __('setlist.order_mismatch'));
                }
            },
        ];
    }
}
