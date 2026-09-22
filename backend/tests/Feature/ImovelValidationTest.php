<?php

namespace Tests\Feature;

use App\Models\Imovel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ImovelValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(now()->setDate(2026, 10, 15)->setTime(12, 0));
        Storage::fake('public');
    }

    private function payload(): array
    {
        return Imovel::factory()->raw([
            'tipo' => 'casa', 'quartos' => 2, 'banheiros' => 1,
            'data_disponibilidade' => '2026-10-15',
        ]);
    }

    public static function invalidFields(): iterable
    {
        $cases = [
            'RN-01 preço negativo' => ['preco', -0.01, 'O preço deve ser maior ou igual a 0.'],
            'RN-01 área zero' => ['area_m2', 0, 'A área deve ser maior que zero.'],
            'RN-01 área negativa' => ['area_m2', -1, 'A área deve ser maior que zero.'],
            'RN-01 quartos negativos' => ['quartos', -1, 'A quantidade de quartos deve ser no mínimo 0.'],
            'RN-01 banheiros negativos' => ['banheiros', -1, 'A quantidade de banheiros deve ser no mínimo 0.'],
            'RN-01 vagas negativas' => ['vagas', -1, 'A quantidade de vagas deve ser no mínimo 0.'],
            'RN-02 ontem' => ['data_disponibilidade', '2026-10-14', 'A data de disponibilidade deve ser hoje ou futura.'],
            'RN-04 tipo' => ['tipo', 'mansao', 'O tipo selecionado é inválido.'],
            'RN-04 finalidade' => ['finalidade', 'troca', 'A finalidade selecionada é inválida.'],
        ];
        foreach (['POST', 'PUT'] as $method) {
            foreach ($cases as $name => $case) {
                yield "$method $name" => [$method, ...$case];
            }
        }
    }

    #[DataProvider('invalidFields')]
    public function test_invalid_domain_fields_return_422_in_portuguese(string $method, string $field, mixed $value, string $message): void
    {
        $imovel = $method === 'PUT' ? Imovel::factory()->create($this->payload()) : null;
        $before = $imovel?->refresh()->getRawOriginal();
        $url = '/api/v1/imoveis'.($imovel ? "/{$imovel->id}" : '');
        $data = $method === 'POST' ? array_replace($this->payload(), [$field => $value]) : [$field => $value];

        $this->json($method, $url, $data)->assertUnprocessable()
            ->assertJsonPath('message', 'Os dados fornecidos são inválidos.')
            ->assertJsonPath("errors.$field.0", $message);
        $this->assertDatabaseCount('imoveis', $imovel ? 1 : 0);
        if ($imovel) {
            $this->assertSame($before, $imovel->fresh()->getRawOriginal());
        }
    }

    public static function terrainCases(): iterable
    {
        foreach (['quartos', 'banheiros'] as $field) {
            yield "cadastro $field" => ['POST', $field, false];
            yield "edição de terreno $field" => ['PUT', $field, false];
            yield "conversão para terreno $field" => ['PUT', $field, true];
        }
    }

    #[DataProvider('terrainCases')]
    public function test_terrain_cannot_have_rooms_even_in_partial_updates(string $method, string $field, bool $convert): void
    {
        $base = array_replace($this->payload(), ['tipo' => 'terreno', 'quartos' => 0, 'banheiros' => 0]);
        $imovel = $method === 'PUT' ? Imovel::factory()->create(array_replace($base, $convert ? ['tipo' => 'casa', $field => 1] : [])) : null;
        $before = $imovel?->refresh()->getRawOriginal();
        $data = $method === 'POST' ? array_replace($base, [$field => 1]) : ($convert ? ['tipo' => 'terreno'] : [$field => 1]);

        $this->json($method, '/api/v1/imoveis'.($imovel ? "/{$imovel->id}" : ''), $data)
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Os dados fornecidos são inválidos.')
            ->assertJsonPath("errors.$field.0", "Um terreno não pode ter $field.");
        $this->assertDatabaseCount('imoveis', $imovel ? 1 : 0);
        if ($imovel) {
            $this->assertSame($before, $imovel->fresh()->getRawOriginal());
        }
    }

    public static function photoCases(): iterable
    {
        foreach (['store', 'update', 'photo'] as $endpoint) {
            yield "$endpoint texto disfarçado" => [$endpoint, 'text', 'O arquivo enviado deve ser uma imagem válida.'];
            yield "$endpoint formato GIF" => [$endpoint, 'gif', $endpoint === 'photo' ? 'A foto deve estar no formato JPEG, PNG ou WEBP.' : 'A foto deve estar no formato JPEG, PNG, JPG ou WEBP.'];
            yield "$endpoint acima de 2 MB" => [$endpoint, 'large', 'A foto deve ter no máximo 2048 KB.'];
        }
    }

    private function png(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    #[DataProvider('photoCases')]
    public function test_invalid_photos_return_422_without_changing_data_or_storage(string $endpoint, string $kind, string $message): void
    {
        $file = match ($kind) {
            'text' => UploadedFile::fake()->createWithContent('falsa.jpg', 'isto não é uma imagem')->mimeType('text/plain'),
            'gif' => UploadedFile::fake()->createWithContent('foto.gif', base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')),
            'large' => UploadedFile::fake()->createWithContent('grande.png', $this->png())->size(2049),
        };
        $imovel = $endpoint !== 'store' ? Imovel::factory()->create(array_replace($this->payload(), ['foto' => 'imoveis/original.png'])) : null;
        if ($imovel) {
            Storage::disk('public')->put($imovel->foto, $this->png());
        }
        $before = $imovel?->refresh()->getRawOriginal();
        $data = $endpoint === 'store' ? $this->payload() : ($endpoint === 'update' ? ['_method' => 'PUT'] : []);
        $url = '/api/v1/imoveis'.($imovel ? "/{$imovel->id}" : '').($endpoint === 'photo' ? '/foto' : '');

        $this->post($url, array_replace($data, ['foto' => $file]), ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Os dados fornecidos são inválidos.')
            ->assertJsonPath('errors.foto.0', $message);
        $this->assertDatabaseCount('imoveis', $imovel ? 1 : 0);
        $this->assertSame($imovel ? ['imoveis/original.png'] : [], Storage::disk('public')->allFiles());
        if ($imovel) {
            $this->assertSame($before, $imovel->fresh()->getRawOriginal());
            $this->assertSame($this->png(), Storage::disk('public')->get($imovel->foto));
        }
    }

    public function test_boundary_values_today_and_a_2mb_photo_are_accepted(): void
    {
        $data = array_replace($this->payload(), [
            'tipo' => 'terreno', 'preco' => 0, 'area_m2' => 0.01,
            'quartos' => 0, 'banheiros' => 0, 'vagas' => 0,
            'foto' => UploadedFile::fake()->createWithContent('limite.png', $this->png())->size(2048),
        ]);
        $response = $this->post('/api/v1/imoveis', $data, ['Accept' => 'application/json'])->assertCreated();
        $imovel = Imovel::findOrFail($response->json('data.id'));
        Storage::disk('public')->assertExists($imovel->foto);
        $this->putJson("/api/v1/imoveis/{$imovel->id}", ['data_disponibilidade' => '2026-10-16'])->assertOk();
    }

    public function test_a_house_can_be_converted_to_terrain_when_rooms_are_zeroed(): void
    {
        $imovel = Imovel::factory()->create($this->payload());
        $this->putJson("/api/v1/imoveis/{$imovel->id}", ['tipo' => 'terreno', 'quartos' => 0, 'banheiros' => 0])
            ->assertOk()->assertJsonPath('data.tipo', 'terreno');
    }
}
