<?php

namespace Tests\Feature;

use App\Models\Imovel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImovelResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_detail_serializes_the_documented_fields_and_types(): void
    {
        $imovel = Imovel::factory()->create([
            'descricao' => null,
            'preco' => '2500.75',
            'area_m2' => '120.50',
            'disponivel' => false,
            'foto' => null,
        ]);

        $this->getJson("/api/v1/imoveis/{$imovel->id}")
            ->assertOk()
            ->assertExactJson(['data' => [
                'id' => $imovel->id,
                'titulo' => $imovel->titulo,
                'descricao' => null,
                'tipo' => $imovel->tipo,
                'finalidade' => $imovel->finalidade,
                'endereco' => $imovel->endereco,
                'cidade' => $imovel->cidade,
                'preco' => 2500.75,
                'area_m2' => 120.5,
                'quartos' => $imovel->quartos,
                'banheiros' => $imovel->banheiros,
                'vagas' => $imovel->vagas,
                'data_disponibilidade' => $imovel->data_disponibilidade->format('Y-m-d'),
                'foto_url' => null,
                'disponivel' => false,
                'contato_telefone' => $imovel->contato_telefone,
                'created_at' => $imovel->created_at->toISOString(),
                'updated_at' => $imovel->updated_at->toISOString(),
            ]])
            ->assertJsonPath('data.preco', 2500.75)
            ->assertJsonPath('data.area_m2', 120.5);
    }

    public function test_detail_exposes_an_absolute_photo_url_without_the_storage_path_field(): void
    {
        $imovel = Imovel::factory()->create(['foto' => 'imoveis/fachada.jpg']);

        $this->getJson("/api/v1/imoveis/{$imovel->id}")
            ->assertOk()
            ->assertJsonPath('data.foto_url', 'http://localhost/storage/imoveis/fachada.jpg')
            ->assertJsonMissingPath('data.foto');
    }

    public function test_list_serializes_resources_with_pagination_and_preserves_filters(): void
    {
        Imovel::factory()->count(3)->create([
            'tipo' => 'casa',
            'preco' => '2500.75',
            'area_m2' => '120.50',
            'foto' => null,
        ]);
        Imovel::factory()->create(['tipo' => 'apartamento']);

        $response = $this->getJson('/api/v1/imoveis?tipo=casa&per_page=2');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.preco', 2500.75)
            ->assertJsonPath('data.0.area_m2', 120.5)
            ->assertJsonPath('data.0.foto_url', null)
            ->assertJsonMissingPath('data.0.foto')
            ->assertJsonStructure([
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'from', 'last_page', 'per_page', 'to', 'total'],
            ])
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('links.prev', null);

        $next = $response->json('links.next');
        parse_str(parse_url($next, PHP_URL_QUERY), $query);
        $this->assertSame(['tipo' => 'casa', 'per_page' => '2', 'page' => '2'], $query);

        $this->getJson($next)->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('links.next', null);
    }

    public function test_empty_list_keeps_the_paginated_response_structure(): void
    {
        $this->getJson('/api/v1/imoveis')->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.total', 0)
            ->assertJsonPath('meta.per_page', 15)
            ->assertJsonPath('links.prev', null)
            ->assertJsonPath('links.next', null);
    }
}
