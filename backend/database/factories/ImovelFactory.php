<?php

namespace Database\Factories;

use App\Models\Imovel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Imovel>
 */
class ImovelFactory extends Factory
{
    protected $model = Imovel::class;

    /**
     * Cidades da Baixada Santista usadas nos anúncios de demonstração.
     *
     * @var list<string>
     */
    private const CIDADES = [
        'Santos/SP',
        'São Vicente/SP',
        'Praia Grande/SP',
        'Guarujá/SP',
        'Cubatão/SP',
        'Bertioga/SP',
        'Mongaguá/SP',
        'Itanhaém/SP',
        'Peruíbe/SP',
    ];

    /**
     * Bairros comuns da região para compor endereços realistas.
     *
     * @var list<string>
     */
    private const BAIRROS = [
        'Centro',
        'Boqueirão',
        'Pompéia',
        'Gonzaga',
        'Ponta da Praia',
        'Embaré',
        'Vila Caiçara',
        'Tupi',
        'Jardim Imperador',
        'Vila Valença',
        'Jardim Casqueiro',
        'Enseada',
        'Pernambuco',
        'Jardim Rio Branco',
        'Centro Histórico',
    ];

    /**
     * Faker pt_BR é configurado via APP_FAKER_LOCALE=pt_BR (.env).
     * Os textos abaixo (títulos, ruas, bairros) já são pt_BR nativos,
     * então a factory gera dados realistas mesmo com fallback en_US.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipo = $this->faker->randomElement([
            'casa', 'casa', 'casa',
            'apartamento', 'apartamento', 'apartamento',
            'kitnet',
            'comercial',
            'terreno',
        ]);

        $finalidade = $this->faker->randomElement(['venda', 'venda', 'aluguel']);

        $cidade = $this->faker->randomElement(self::CIDADES);
        // Cidade curta (ex.: "Santos") para usar dentro do título.
        $cidadeCurta = explode('/', $cidade)[0];

        return [
            'titulo' => $this->titulo($tipo, $finalidade, $cidadeCurta),
            'descricao' => $this->descricao($tipo, $finalidade),
            'tipo' => $tipo,
            'finalidade' => $finalidade,
            'endereco' => $this->endereco(),
            'cidade' => $cidade,
            'preco' => $this->preco($tipo, $finalidade),
            'area_m2' => $this->area($tipo),
            'quartos' => $this->quartos($tipo),
            'banheiros' => $this->banheiros($tipo),
            'vagas' => $this->vagas($tipo),
            // RN: disponibilidade sempre hoje ou futura (validação after_or_equal:today).
            'data_disponibilidade' => now()->addDays($this->faker->numberBetween(0, 180))->format('Y-m-d'),
            // Seed sem arquivos: foto fica null e a API serializa foto_url como null.
            'foto' => null,
            'disponivel' => $this->faker->boolean(85),
            'contato_telefone' => sprintf('(13) 9%04d-%04d', mt_rand(1000, 9999), mt_rand(1000, 9999)),
        ];
    }

    private function titulo(string $tipo, string $finalidade, string $cidade): string
    {
        $operacao = $finalidade === 'venda' ? 'à venda' : 'para alugar';

        $modelos = match ($tipo) {
            'casa' => [
                'Casa %d quartos com quintal %s em %s',
                'Casa %d quartos com churrasqueira %s em %s',
                'Casa térrea %d quartos perto da praia %s em %s',
            ],
            'apartamento' => [
                'Apartamento %d quartos mobiliado %s em %s',
                'Apartamento %d quartos com varanda %s em %s',
                'Apartamento %d quartos perto do mar %s em %s',
            ],
            'kitnet' => [
                'Kitnet mobiliada %s em %s',
                'Kitnet compacta %s em %s',
            ],
            'comercial' => [
                'Sala comercial %s em %s',
                'Loja comercial %s em %s',
                'Ponto comercial %s em %s',
            ],
            'terreno' => [
                'Terreno plano %s em %s',
                'Terreno em condomínio %s em %s',
            ],
        };

        $modelo = $this->faker->randomElement($modelos);

        // Modelos com %d recebem o nº de quartos; demais recebem só operação + cidade.
        if (str_contains($modelo, '%d')) {
            $quartos = $tipo === 'casa'
                ? $this->faker->numberBetween(2, 5)
                : $this->faker->numberBetween(1, 3);

            $titulo = sprintf($modelo, $quartos, $operacao, $cidade);

            // Concordância: "1 quartos" -> "1 quarto".
            if ($quartos === 1) {
                $titulo = str_replace('1 quartos', '1 quarto', $titulo);
            }

            return substr($titulo, 0, 150);
        }

        return substr(sprintf($modelo, $operacao, $cidade), 0, 150);
    }

    private function descricao(string $tipo, string $finalidade): string
    {
        $extras = [
            'ótima ventilação e iluminação natural',
            'próximo ao comércio, escolas e transporte público',
            'rua tranquila e arborizada',
            'fácil acesso à praia e à rodovia',
            'documentação pronta para financiamento',
            'aceita pets',
        ];

        $base = match ($tipo) {
            'casa' => 'Casa ampla com quintal e área gourmet',
            'apartamento' => 'Apartamento bem localizado com vista livre',
            'kitnet' => 'Kitnet funcional e mobiliada, ideal para quem trabalha na região',
            'comercial' => 'Imóvel comercial com ótimo fluxo de pessoas',
            'terreno' => 'Terreno com topografia plana, pronto para construir',
        };

        $operacao = $finalidade === 'venda' ? 'venda' : 'aluguel';

        return sprintf(
            '%s para %s. %s.',
            $base,
            $operacao,
            $this->faker->randomElement($extras)
        );
    }

    private function endereco(): string
    {
        $logradouro = $this->faker->randomElement([
            'Rua', 'Avenida', 'Travessa', 'Alameda',
        ]);

        // Nomes pt_BR nativos (independem do locale do Faker).
        $nomes = [
            'das Palmeiras', 'dos Andradas', 'XV de Novembro',
            'Marechal Deodoro', 'João Pessoa', 'do Comércio',
            'Castro Alves', 'Presidente Kennedy', 'Dom Pedro I',
            'Marechal Rondon', 'São Francisco', 'José Bonifácio',
        ];

        $numero = $this->faker->numberBetween(10, 2999);
        $complemento = $this->faker->optional(0.3)->randomElement([
            'Apto 12', 'Apto 34', 'Bloco B', 'Casa 2', 'Sala 5', 'Fundos',
        ]);
        $bairro = $this->faker->randomElement(self::BAIRROS);

        $endereco = sprintf(
            '%s %s, %d - %s',
            $logradouro,
            $this->faker->randomElement($nomes),
            $numero,
            $bairro
        );

        if ($complemento) {
            $endereco .= ' - '.$complemento;
        }

        return substr($endereco, 0, 200);
    }

    private function preco(string $tipo, string $finalidade): float
    {
        if ($finalidade === 'aluguel') {
            $faixa = match ($tipo) {
                'kitnet' => [900, 2200],
                'apartamento' => [1500, 4500],
                'casa' => [1800, 6500],
                'comercial' => [2000, 8000],
                'terreno' => [800, 3000],
            };

            return round($this->faker->randomFloat(2, $faixa[0], $faixa[1]), 2);
        }

        $faixa = match ($tipo) {
            'kitnet' => [150000, 350000],
            'apartamento' => [280000, 850000],
            'casa' => [350000, 1500000],
            'comercial' => [300000, 1200000],
            'terreno' => [180000, 700000],
        };

        return round($this->faker->randomFloat(2, $faixa[0], $faixa[1]), 2);
    }

    private function area(string $tipo): float
    {
        $faixa = match ($tipo) {
            'kitnet' => [25, 45],
            'apartamento' => [45, 120],
            'casa' => [60, 300],
            'comercial' => [30, 400],
            'terreno' => [100, 1000],
        };

        return round($this->faker->randomFloat(2, $faixa[0], $faixa[1]), 2);
    }

    private function quartos(string $tipo): int
    {
        return match ($tipo) {
            'kitnet' => 1,
            'terreno' => 0,
            'comercial' => $this->faker->numberBetween(0, 2),
            'apartamento' => $this->faker->numberBetween(1, 4),
            'casa' => $this->faker->numberBetween(2, 5),
        };
    }

    private function banheiros(string $tipo): int
    {
        return match ($tipo) {
            'terreno' => $this->faker->numberBetween(0, 1),
            'kitnet' => 1,
            'comercial' => $this->faker->numberBetween(1, 3),
            default => $this->faker->numberBetween(1, 4),
        };
    }

    private function vagas(string $tipo): int
    {
        return match ($tipo) {
            'terreno' => 0,
            'kitnet' => $this->faker->numberBetween(0, 1),
            default => $this->faker->numberBetween(0, 3),
        };
    }
}
