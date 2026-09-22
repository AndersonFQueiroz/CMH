<?php

namespace Tests\Feature;

use App\Http\Requests\StoreImovelRequest;
use App\Http\Requests\UpdateImovelRequest;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ImovelRequestsTest extends TestCase
{
    use RefreshDatabase;
    private function getValidImageContent(): string
    {
        // 1x1 pixel PNG em base64
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }

    private function dadosValidosCriacao(): array
    {
        return [
            'titulo' => 'Casa aconchegante com quintal',
            'descricao' => 'Excelente casa em bairro tranquilo.',
            'tipo' => 'casa',
            'finalidade' => 'venda',
            'endereco' => 'Rua das Flores, 123 - Centro',
            'cidade' => 'Santos/SP',
            'preco' => 350000.00,
            'area_m2' => 120.50,
            'quartos' => 3,
            'banheiros' => 2,
            'vagas' => 1,
            'data_disponibilidade' => Carbon::now()->addDays(5)->toDateString(),
            'disponivel' => true,
            'contato_telefone' => '(13) 99999-1234',
        ];
    }

    public function test_store_imovel_request_valida_dados_corretos(): void
    {
        $request = new StoreImovelRequest;
        $validator = Validator::make($this->dadosValidosCriacao(), $request->rules(), $request->messages(), $request->attributes());

        $this->assertTrue($validator->passes());
    } 
public function test_store_imovel_request_rejeita_terreno_com_quartos_ou_banheiros(): void
{
    $response = $this->postJson('/api/v1/imoveis', array_merge(
        $this->dadosValidosCriacao(),
        ['tipo' => 'terreno', 'quartos' => 2, 'banheiros' => 1]
    ));

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['quartos', 'banheiros']);
}

public function test_store_imovel_request_aceita_terreno_com_quartos_e_banheiros_zerados(): void
{
    $response = $this->postJson('/api/v1/imoveis', array_merge(
        $this->dadosValidosCriacao(),
        ['tipo' => 'terreno', 'quartos' => 0, 'banheiros' => 0]
    ));

    $response->assertStatus(201);
}
    public function test_store_imovel_request_falha_quando_campos_obrigatorios_estao_ausentes(): void
    {
        $response = $this->postJson('/api/v1/imoveis', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'titulo',
            'tipo',
            'finalidade',
            'endereco',
            'cidade',
            'preco',
            'area_m2',
            'quartos',
            'banheiros',
            'data_disponibilidade',
            'contato_telefone',
        ]);

        $errors = $response->json('errors');
        $this->assertEquals('O título é obrigatório.', $errors['titulo'][0]);
        $this->assertEquals('O tipo do imóvel é obrigatório.', $errors['tipo'][0]);
        $this->assertEquals('A finalidade é obrigatória.', $errors['finalidade'][0]);
        $this->assertEquals('O endereço é obrigatório.', $errors['endereco'][0]);
        $this->assertEquals('A cidade é obrigatória.', $errors['cidade'][0]);
        $this->assertEquals('O preço é obrigatório.', $errors['preco'][0]);
        $this->assertEquals('A área em m² é obrigatória.', $errors['area_m2'][0]);
        $this->assertEquals('A quantidade de quartos é obrigatória.', $errors['quartos'][0]);
        $this->assertEquals('A quantidade de banheiros é obrigatória.', $errors['banheiros'][0]);
        $this->assertEquals('A data de disponibilidade é obrigatória.', $errors['data_disponibilidade'][0]);
        $this->assertEquals('O telefone de contato é obrigatório.', $errors['contato_telefone'][0]);
    }

    public function test_store_imovel_request_valida_regras_de_dominio(): void
    {
        $dadosInvalidos = array_merge($this->dadosValidosCriacao(), [
            'titulo' => 'Oi', // menor que 5 caracteres
            'tipo' => 'mansao_espacial', // inválido
            'finalidade' => 'troca', // inválido
            'preco' => -100, // negativo
            'area_m2' => 0, // menor que 0.01
            'quartos' => 60, // acima de 50
            'banheiros' => 25, // acima de 20
            'vagas' => 30, // acima de 20
            'data_disponibilidade' => '2020-01-01', // no passado
        ]);

        $response = $this->postJson('/api/v1/imoveis', $dadosInvalidos);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'titulo',
            'tipo',
            'finalidade',
            'preco',
            'area_m2',
            'quartos',
            'banheiros',
            'vagas',
            'data_disponibilidade',
        ]);

        $errors = $response->json('errors');
        $this->assertEquals('O título deve ter no mínimo 5 caracteres.', $errors['titulo'][0]);
        $this->assertEquals('O tipo selecionado é inválido.', $errors['tipo'][0]);
        $this->assertEquals('A finalidade selecionada é inválida.', $errors['finalidade'][0]);
        $this->assertEquals('O preço deve ser maior ou igual a 0.', $errors['preco'][0]);
        $this->assertEquals('A área deve ser maior que zero.', $errors['area_m2'][0]);
        $this->assertEquals('A quantidade de quartos deve ser no máximo 50.', $errors['quartos'][0]);
        $this->assertEquals('A quantidade de banheiros deve ser no máximo 20.', $errors['banheiros'][0]);
        $this->assertEquals('A quantidade de vagas deve ser no máximo 20.', $errors['vagas'][0]);
        $this->assertEquals('A data de disponibilidade deve ser hoje ou futura.', $errors['data_disponibilidade'][0]);
    }

    public function test_store_imovel_request_valida_foto(): void
    {
        Storage::fake('public');

        $imageContent = $this->getValidImageContent();
        $arquivoTexto = UploadedFile::fake()->create('documento.txt', 100, 'text/plain');
        $arquivoGigante = UploadedFile::fake()->createWithContent('pesada.png', $imageContent . str_repeat('A', 2500 * 1024));

        $request = new StoreImovelRequest;

        $validadorTexto = Validator::make(
            ['foto' => $arquivoTexto],
            ['foto' => $request->rules()['foto']],
            $request->messages()
        );
        $this->assertTrue($validadorTexto->fails());
        $this->assertEquals('O arquivo enviado deve ser uma imagem válida.', $validadorTexto->errors()->first('foto'));

        $validadorGigante = Validator::make(
            ['foto' => $arquivoGigante],
            ['foto' => $request->rules()['foto']],
            $request->messages()
        );
        $this->assertTrue($validadorGigante->fails());
        $this->assertEquals('A foto deve ter no máximo 2048 KB.', $validadorGigante->errors()->first('foto'));

        $fotoValida = UploadedFile::fake()->createWithContent('fachada.png', $imageContent);
        $validadorValido = Validator::make(
            ['foto' => $fotoValida],
            ['foto' => $request->rules()['foto']],
            $request->messages()
        );
        $this->assertTrue($validadorValido->passes());
    }

    public function test_update_imovel_request_permite_edicao_parcial(): void
    {
        $request = new UpdateImovelRequest;

        // Apenas titulo
        $validadorTitulo = Validator::make(['titulo' => 'Novo Título Atualizado'], $request->rules(), $request->messages());
        $this->assertTrue($validadorTitulo->passes());

        // Apenas preco
        $validadorPreco = Validator::make(['preco' => 2500.00], $request->rules(), $request->messages());
        $this->assertTrue($validadorPreco->passes());

        // Apenas disponivel
        $validadorDisponivel = Validator::make(['disponivel' => false], $request->rules(), $request->messages());
        $this->assertTrue($validadorDisponivel->passes());
    }

    public function test_update_imovel_request_falha_quando_campo_enviado_for_invalido(): void
    {
        $request = new UpdateImovelRequest;

        $validador = Validator::make([
            'preco' => -50,
            'tipo' => 'tipo_inexistente',
        ], $request->rules(), $request->messages());

        $this->assertTrue($validador->fails());
        $this->assertEquals('O preço deve ser maior ou igual a 0.', $validador->errors()->first('preco'));
        $this->assertEquals('O tipo selecionado é inválido.', $validador->errors()->first('tipo'));
    }

    public function test_update_imovel_request_suporta_truque_method_put_e_remove_do_validated(): void
    {
        Storage::fake('public');

        $foto = UploadedFile::fake()->createWithContent('nova_fachada.png', $this->getValidImageContent());

        $request = UpdateImovelRequest::create('/api/v1/imoveis/1', 'POST', [
            '_method' => 'PUT',
            'titulo' => 'Título Atualizado via POST Spoofing',
            'preco' => 450000.00,
        ], [], [
            'foto' => $foto,
        ]);

        $request->setContainer(app());

        $validador = Validator::make($request->all(), $request->rules(), $request->messages());
        $this->assertTrue($validador->passes());

        $request->setValidator($validador);
        $dadosValidados = $request->validated();

        $this->assertArrayNotHasKey('_method', $dadosValidados);
        $this->assertEquals('Título Atualizado via POST Spoofing', $dadosValidados['titulo']);
        $this->assertEquals(450000.00, $dadosValidados['preco']);
        $this->assertTrue($request->hasFile('foto'));
    }
}

