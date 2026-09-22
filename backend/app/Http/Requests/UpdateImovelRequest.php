<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateImovelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            '_method' => ['sometimes', 'string', 'in:PUT,PATCH,put,patch'],
            'titulo' => ['sometimes', 'required', 'string', 'min:5', 'max:150'],
            'descricao' => ['sometimes', 'nullable', 'string'],
            'tipo' => ['sometimes', 'required', 'string', 'in:casa,apartamento,kitnet,comercial,terreno'],
            'finalidade' => ['sometimes', 'required', 'string', 'in:venda,aluguel'],
            'endereco' => ['sometimes', 'required', 'string', 'max:200'],
            'cidade' => ['sometimes', 'required', 'string', 'max:100'],
            'preco' => ['sometimes', 'required', 'numeric', 'min:0'],
            'area_m2' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'quartos' => ['sometimes', 'required', 'integer', 'min:0', 'max:50'],
            'banheiros' => ['sometimes', 'required', 'integer', 'min:0', 'max:20'],
            'vagas' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:20'],
            'data_disponibilidade' => ['sometimes', 'required', 'date', 'after_or_equal:today'],
            'foto' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'disponivel' => ['sometimes', 'boolean'],
            'contato_telefone' => ['sometimes', 'required', 'string', 'max:20'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $imovel = $this->route('imovel');
            $tipo = $this->input('tipo', $imovel?->tipo);

            if ($tipo !== 'terreno') {
                return;
            }

            foreach (['quartos', 'banheiros'] as $campo) {
                if ((int) $this->input($campo, $imovel?->{$campo} ?? 0) !== 0) {
                    $validator->errors()->add($campo, "Um terreno não pode ter {$campo}.");
                }
            }
        });
    }

    /**
     * Get the validated data from the request, excluding internal HTTP method override spoofing field.
     *
     * @param  array|int|string|null  $key
     * @param  mixed  $default
     * @return mixed
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        if (is_array($validated)) {
            unset($validated['_method']);
        }

        return $validated;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            '_method.in' => 'O método de atualização deve ser PUT ou PATCH.',

            'titulo.required' => 'O título é obrigatório.',
            'titulo.string' => 'O título deve ser um texto.',
            'titulo.min' => 'O título deve ter no mínimo :min caracteres.',
            'titulo.max' => 'O título deve ter no máximo :max caracteres.',

            'descricao.string' => 'A descrição deve ser um texto.',

            'tipo.required' => 'O tipo do imóvel é obrigatório.',
            'tipo.string' => 'O tipo do imóvel deve ser um texto.',
            'tipo.in' => 'O tipo selecionado é inválido.',

            'finalidade.required' => 'A finalidade é obrigatória.',
            'finalidade.string' => 'A finalidade deve ser um texto.',
            'finalidade.in' => 'A finalidade selecionada é inválida.',

            'endereco.required' => 'O endereço é obrigatório.',
            'endereco.string' => 'O endereço deve ser um texto.',
            'endereco.max' => 'O endereço deve ter no máximo :max caracteres.',

            'cidade.required' => 'A cidade é obrigatória.',
            'cidade.string' => 'A cidade deve ser um texto.',
            'cidade.max' => 'A cidade deve ter no máximo :max caracteres.',

            'preco.required' => 'O preço é obrigatório.',
            'preco.numeric' => 'O preço deve ser um valor numérico.',
            'preco.min' => 'O preço deve ser maior ou igual a 0.',

            'area_m2.required' => 'A área em m² é obrigatória.',
            'area_m2.numeric' => 'A área deve ser um valor numérico.',
            'area_m2.min' => 'A área deve ser maior que zero.',

            'quartos.required' => 'A quantidade de quartos é obrigatória.',
            'quartos.integer' => 'A quantidade de quartos deve ser um número inteiro.',
            'quartos.min' => 'A quantidade de quartos deve ser no mínimo :min.',
            'quartos.max' => 'A quantidade de quartos deve ser no máximo :max.',

            'banheiros.required' => 'A quantidade de banheiros é obrigatória.',
            'banheiros.integer' => 'A quantidade de banheiros deve ser um número inteiro.',
            'banheiros.min' => 'A quantidade de banheiros deve ser no mínimo :min.',
            'banheiros.max' => 'A quantidade de banheiros deve ser no máximo :max.',

            'vagas.integer' => 'A quantidade de vagas deve ser um número inteiro.',
            'vagas.min' => 'A quantidade de vagas deve ser no mínimo :min.',
            'vagas.max' => 'A quantidade de vagas deve ser no máximo :max.',

            'data_disponibilidade.required' => 'A data de disponibilidade é obrigatória.',
            'data_disponibilidade.date' => 'A data de disponibilidade deve ser uma data válida.',
            'data_disponibilidade.after_or_equal' => 'A data de disponibilidade deve ser hoje ou futura.',

            'foto.image' => 'O arquivo enviado deve ser uma imagem válida.',
            'foto.mimes' => 'A foto deve estar no formato JPEG, PNG, JPG ou WEBP.',
            'foto.max' => 'A foto deve ter no máximo 2048 KB.',

            'disponivel.boolean' => 'O campo disponível deve ser verdadeiro ou falso.',

            'contato_telefone.required' => 'O telefone de contato é obrigatório.',
            'contato_telefone.string' => 'O telefone de contato deve ser um texto.',
            'contato_telefone.max' => 'O telefone de contato deve ter no máximo :max caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'descricao' => 'descrição',
            'tipo' => 'tipo',
            'finalidade' => 'finalidade',
            'endereco' => 'endereço',
            'cidade' => 'cidade',
            'preco' => 'preço',
            'area_m2' => 'área em m²',
            'quartos' => 'quartos',
            'banheiros' => 'banheiros',
            'vagas' => 'vagas',
            'data_disponibilidade' => 'data de disponibilidade',
            'foto' => 'foto',
            'disponivel' => 'disponível',
            'contato_telefone' => 'telefone de contato',
        ];
    }
}
