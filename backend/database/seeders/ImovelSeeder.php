<?php

namespace Database\Seeders;

use App\Models\Imovel;
use Illuminate\Database\Seeder;

class ImovelSeeder extends Seeder
{
    /**
     * Massa de demonstração para o Expo Go: ~20 anúncios variados
     * (casas, apartamentos, kitnets, comercial e terreno — venda e aluguel).
     */
    public function run(): void
    {
        // Base aleatória cobre todos os tipos/finalidades via ImovelFactory.
        Imovel::factory()->count(12)->create();

        // Garante variedade mínima por tipo para a demonstração.
        Imovel::factory()->create(['tipo' => 'casa', 'finalidade' => 'venda']);
        Imovel::factory()->create(['tipo' => 'casa', 'finalidade' => 'aluguel']);
        Imovel::factory()->create(['tipo' => 'apartamento', 'finalidade' => 'venda']);
        Imovel::factory()->create(['tipo' => 'apartamento', 'finalidade' => 'aluguel']);
        Imovel::factory()->create(['tipo' => 'kitnet', 'finalidade' => 'aluguel']);
        Imovel::factory()->create(['tipo' => 'comercial', 'finalidade' => 'aluguel']);
        Imovel::factory()->create(['tipo' => 'comercial', 'finalidade' => 'venda']);
        Imovel::factory()->create(['tipo' => 'terreno', 'finalidade' => 'venda']);
    }
}
