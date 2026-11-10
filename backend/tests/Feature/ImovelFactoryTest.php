<?php

namespace Tests\Feature;

use App\Models\Imovel;
use Database\Seeders\ImovelSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImovelFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_com_tipo_recria_titulo_e_campos_coerentes(): void
    {
        $casa = Imovel::factory()->comTipo('casa', 'aluguel')->make();
        $this->assertSame('casa', $casa->tipo);
        $this->assertStringStartsWith('Casa', $casa->titulo);
        $this->assertStringContainsString('alugar', $casa->titulo);
        $this->assertGreaterThan(0, $casa->quartos);
        $this->assertGreaterThan(0, $casa->banheiros);

        $terreno = Imovel::factory()->comTipo('terreno', 'venda')->make();
        $this->assertSame('terreno', $terreno->tipo);
        $this->assertStringStartsWith('Terreno', $terreno->titulo);
        $this->assertSame(0, $terreno->quartos);
        $this->assertSame(0, $terreno->banheiros);
        $this->assertSame(0, $terreno->vagas);
    }

    public function test_sobrescrever_o_tipo_para_terreno_tambem_zera_os_comodos(): void
    {
        $terreno = Imovel::factory()->make([
            'tipo' => 'terreno',
            'quartos' => 3,
            'banheiros' => 2,
            'vagas' => 1,
        ]);

        $this->assertSame(0, $terreno->quartos);
        $this->assertSame(0, $terreno->banheiros);
        $this->assertSame(0, $terreno->vagas);
    }

    public function test_seeder_nao_cria_terreno_com_comodos_nem_titulo_de_outro_tipo(): void
    {
        $this->seed(ImovelSeeder::class);

        $comodosInvalidos = Imovel::where('tipo', 'terreno')
            ->where(function ($query): void {
                $query->where('quartos', '>', 0)
                    ->orWhere('banheiros', '>', 0)
                    ->orWhere('vagas', '>', 0);
            })
            ->count();

        $titulosInvalidos = Imovel::where('tipo', 'terreno')
            ->where('titulo', 'not like', 'Terreno%')
            ->count();

        $this->assertSame(0, $comodosInvalidos);
        $this->assertSame(0, $titulosInvalidos);
    }
}
