<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Imovel extends Model
{
    /** @use HasFactory<ImovelFactory> */
    use HasFactory;

    /**
     * Nome explícito da tabela (o pluralizador inglês geraria `imovels`).
     *
     * @var string
     */
    protected $table = 'imoveis';

    /**
     * Atributos liberados para mass assignment (RF-04).
     *
     * @var list<string>
     */
    protected $fillable = [
        'titulo',
        'descricao',
        'tipo',
        'finalidade',
        'endereco',
        'cidade',
        'preco',
        'area_m2',
        'quartos',
        'banheiros',
        'vagas',
        'data_disponibilidade',
        'foto',
        'disponivel',
        'contato_telefone',
    ];

    /**
     * Acessores virtuais incluídos na serialização JSON (RF-03, RF-05).
     *
     * @var list<string>
     */
    protected $appends = ['foto_url'];

    /**
     * Casts nativos garantindo tipos corretos na serialização.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'preco' => 'decimal:2',
            'area_m2' => 'decimal:2',
            'quartos' => 'integer',
            'banheiros' => 'integer',
            'vagas' => 'integer',
            'disponivel' => 'boolean',
            'data_disponibilidade' => 'date:Y-m-d',
        ];
    }

    /**
     * URL pública absoluta da foto da fachada para o app mobile.
     * Retorna null quando o anúncio não possui foto (RN-06: fallback no app).
     */
    protected function fotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->foto
                ? asset(Storage::url($this->foto))
                : null,
        );
    }

    /**
     * Sanitização do telefone de contato: remove espaços extras.
     */
    protected function contatoTelefone(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value === null
                ? null
                : (string) preg_replace('/\s+/', ' ', trim($value)),
        );
    }
}
