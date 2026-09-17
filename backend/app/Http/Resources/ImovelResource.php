<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImovelResource extends JsonResource
{
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
            'preco' => $this->preco,
            'area_m2' => $this->area_m2,
            'quartos' => $this->quartos,
            'banheiros' => $this->banheiros,
            'vagas' => $this->vagas,
            'data_disponibilidade' => $this->data_disponibilidade,
            'foto' => $this->foto,
            'foto_url' => $this->foto ? asset('storage/' . $this->foto) : null,
            'disponivel' => (bool) $this->disponivel,
            'contato_telefone' => $this->contato_telefone,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}