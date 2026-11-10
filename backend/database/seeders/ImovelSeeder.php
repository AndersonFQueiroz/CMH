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

        // Garante variedade mínima por tipo, recriando os campos dependentes
        // para o título/preço/cômodos combinarem com o tipo escolhido.
        Imovel::factory()->comTipo('casa', 'venda')->create();
        Imovel::factory()->comTipo('casa', 'aluguel')->create();
        Imovel::factory()->comTipo('apartamento', 'venda')->create();
        Imovel::factory()->comTipo('apartamento', 'aluguel')->create();
        Imovel::factory()->comTipo('kitnet', 'aluguel')->create();
        Imovel::factory()->comTipo('comercial', 'aluguel')->create();
        Imovel::factory()->comTipo('comercial', 'venda')->create();
        Imovel::factory()->comTipo('terreno', 'venda')->create();
    }
}
