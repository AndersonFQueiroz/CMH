<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImovelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'tipo' => $this->tipo,
            'finalidade' => $this->finalidade,
            'endereco' => $this->endereco,
            'cidade' => $this->cidade,
            'preco' => (float) $this->preco,
            'area_m2' => (float) $this->area_m2,
            'quartos' => $this->quartos,
            'banheiros' => $this->banheiros,
            'vagas' => $this->vagas,
            'data_disponibilidade' => $this->data_disponibilidade->format('Y-m-d'),
            'foto_url' => $this->foto_url,
            'disponivel' => $this->disponivel,
            'contato_telefone' => $this->contato_telefone,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
