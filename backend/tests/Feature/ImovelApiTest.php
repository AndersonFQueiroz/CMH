<?php

namespace Tests\Feature;

use App\Models\Imovel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Issue #12 — Testes de integração da API imoveis (RNF-07 + qualidade CMH).
 *
 * Cobre: listagem paginada, filtros, criação com/sem foto (Storage::fake),
 * detalhe 200/404, update, troca de foto, delete 204 + remoção arquivo.
 * Suite verde com `php artisan test`.
 */
class ImovelApiTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $over = []): array
    {
        return array_merge(Imovel::factory()->raw([
            'tipo' => 'casa',
            'quartos' => 2,
            'banheiros' => 1,
            'data_disponibilidade' => now()->addDays(5)->toDateString(),
            'foto' => null,
        ]), $over);
    }

    private function png(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    public function test_listagem_paginada(): void
    {
        Imovel::factory()->count(3)->create();

        $this->getJson('/api/v1/imoveis?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure(['data', 'links' => ['first', 'last', 'prev', 'next'], 'meta' => ['current_page', 'per_page', 'total']])
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.per_page', 2);
    }

    public function test_filtros_por_tipo_finalidade_cidade_e_preco(): void
    {
        Imovel::factory()->create(['tipo' => 'casa', 'finalidade' => 'venda', 'cidade' => 'Santos/SP', 'preco' => 300000, 'titulo' => 'Casa em Santos']);
        Imovel::factory()->create(['tipo' => 'apartamento', 'finalidade' => 'aluguel', 'cidade' => 'Praia Grande/SP', 'preco' => 1500, 'titulo' => 'Apartamento na Praia']);

        $this->getJson('/api/v1/imoveis?tipo=casa')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/imoveis?finalidade=aluguel')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/imoveis?cidade=Santos')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/imoveis?preco_min=200000&preco_max=400000')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/imoveis?busca=Praia')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_criacao_sem_foto(): void
    {
        Storage::fake('public');

        $this->postJson('/api/v1/imoveis', $this->payload())
            ->assertCreated()
            ->assertJsonPath('message', 'Imóvel cadastrado com sucesso!')
            ->assertJsonPath('data.foto_url', null);

        $this->assertDatabaseCount('imoveis', 1);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_criacao_com_foto_fake_storage(): void
    {
        Storage::fake('public');
        $foto = UploadedFile::fake()->createWithContent('fachada.png', $this->png());

        $res = $this->post('/api/v1/imoveis', array_merge($this->payload(), ['foto' => $foto]), ['Accept' => 'application/json'])
            ->assertCreated();

        $imovel = Imovel::findOrFail($res->json('data.id'));
        Storage::disk('public')->assertExists($imovel->foto);
        $this->assertNotNull($res->json('data.foto_url'));
    }

    public function test_detalhe_200_e_404(): void
    {
        $imovel = Imovel::factory()->create();

        $this->getJson("/api/v1/imoveis/{$imovel->id}")->assertOk()->assertJsonPath('data.id', $imovel->id);
        $this->getJson('/api/v1/imoveis/999999')->assertNotFound();
    }

    public function test_update_imovel(): void
    {
        $imovel = Imovel::factory()->create(['titulo' => 'Antigo', 'preco' => 100000]);

        $this->putJson("/api/v1/imoveis/{$imovel->id}", ['titulo' => 'Novo Título', 'preco' => 200000])
            ->assertOk()
            ->assertJsonPath('message', 'Imóvel atualizado com sucesso!')
            ->assertJsonPath('data.titulo', 'Novo Título');

        $this->assertDatabaseHas('imoveis', ['id' => $imovel->id, 'titulo' => 'Novo Título']);
    }

    public function test_update_com_foto_remove_anterior(): void
    {
        Storage::fake('public');
        $fotoAntiga = UploadedFile::fake()->createWithContent('antiga.png', $this->png());
        $imovel = Imovel::factory()->create(['foto' => null]);
        // cria com foto para ter arquivo
        $res = $this->post('/api/v1/imoveis', array_merge($this->payload(), ['foto' => $fotoAntiga]), ['Accept' => 'application/json'])->assertCreated();
        $imovel = Imovel::findOrFail($res->json('data.id'));
        $antigaPath = $imovel->foto;
        Storage::disk('public')->assertExists($antigaPath);

        $fotoNova = UploadedFile::fake()->createWithContent('nova.png', $this->png());
        $this->post("/api/v1/imoveis/{$imovel->id}", ['_method' => 'PUT', 'foto' => $fotoNova], ['Accept' => 'application/json'])
            ->assertOk();

        Storage::disk('public')->assertMissing($antigaPath);
        $imovel->refresh();
        Storage::disk('public')->assertExists($imovel->foto);
    }

    public function test_troca_de_foto_endpoint(): void
    {
        Storage::fake('public');
        $imovel = Imovel::factory()->create(['foto' => 'imoveis/original.png']);
        Storage::disk('public')->put($imovel->foto, $this->png());

        $nova = UploadedFile::fake()->createWithContent('nova.png', $this->png());
        $this->post("/api/v1/imoveis/{$imovel->id}/foto", ['foto' => $nova], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('message', 'Foto do imóvel atualizada com sucesso!');

        Storage::disk('public')->assertMissing('imoveis/original.png');
        $imovel->refresh();
        Storage::disk('public')->assertExists($imovel->foto);
    }

    public function test_delete_204_e_remove_arquivo(): void
    {
        Storage::fake('public');
        $foto = UploadedFile::fake()->createWithContent('fachada.png', $this->png());
        $res = $this->post('/api/v1/imoveis', array_merge($this->payload(), ['foto' => $foto]), ['Accept' => 'application/json'])->assertCreated();
        $imovel = Imovel::findOrFail($res->json('data.id'));
        $path = $imovel->foto;
        Storage::disk('public')->assertExists($path);

        $this->deleteJson("/api/v1/imoveis/{$imovel->id}")->assertNoContent();

        $this->assertDatabaseMissing('imoveis', ['id' => $imovel->id]);
        Storage::disk('public')->assertMissing($path);
    }
}
