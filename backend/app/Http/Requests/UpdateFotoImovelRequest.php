<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFotoImovelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'foto' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'foto.required' => 'A foto é obrigatória.',
            'foto.image' => 'O arquivo enviado deve ser uma imagem válida.',
            'foto.mimes' => 'A foto deve estar no formato JPEG, PNG ou WEBP.',
            'foto.max' => 'A foto deve ter no máximo 2048 KB.',
        ];
    }
}
