<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreImovelRequest;
use App\Http\Requests\UpdateFotoImovelRequest;
use App\Http\Requests\UpdateImovelRequest;
use App\Http\Resources\ImovelResource;
use App\Models\Imovel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ImovelController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $busca = $request->string('busca')->trim()->toString();
        $cidade = $request->string('cidade')->trim()->toString();
        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        $imoveis = Imovel::query()
            ->when($busca !== '', function (Builder $query) use ($busca): void {
                $query->where(function (Builder $query) use ($busca): void {
                    $query->whereLike('titulo', "%{$busca}%")
                        ->orWhereLike('endereco', "%{$busca}%");
                });
            })
            ->when($request->filled('tipo'), function (Builder $query) use ($request): void {
                $query->where('tipo', $request->string('tipo')->toString());
            })
            ->when($request->filled('finalidade'), function (Builder $query) use ($request): void {
                $query->where('finalidade', $request->string('finalidade')->toString());
            })
            ->when($cidade !== '', function (Builder $query) use ($cidade): void {
                $query->whereLike('cidade', "%{$cidade}%");
            })
            ->when($request->has('disponivel'), function (Builder $query) use ($request): void {
                $query->where('disponivel', $request->boolean('disponivel'));
            })
            ->when($request->has('preco_min'), function (Builder $query) use ($request): void {
                $query->where('preco', '>=', $request->input('preco_min'));
            })
            ->when($request->has('preco_max'), function (Builder $query) use ($request): void {
                $query->where('preco', '<=', $request->input('preco_max'));
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ImovelResource::collection($imoveis);
    }

    public function store(StoreImovelRequest $request): JsonResponse
    {
        $dados = $request->validated();

        if ($request->hasFile('foto')) {
            $dados['foto'] = Storage::disk('public')->putFile('imoveis', $request->file('foto'));
        }

        $imovel = Imovel::query()->create($dados);

        return (new ImovelResource($imovel))
            ->additional(['message' => 'Imóvel cadastrado com sucesso!'])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Imovel $imovel): ImovelResource
    {
        return new ImovelResource($imovel);
    }

    public function update(UpdateImovelRequest $request, Imovel $imovel): JsonResponse
    {
        $dados = $request->validated();
        $fotoAnterior = $imovel->foto;

        if ($request->hasFile('foto')) {
            $dados['foto'] = Storage::disk('public')->putFile('imoveis', $request->file('foto'));
        }

        $imovel->update($dados);

        if ($request->hasFile('foto') && $fotoAnterior) {
            Storage::disk('public')->delete($fotoAnterior);
        }

        return (new ImovelResource($imovel->refresh()))
            ->additional(['message' => 'Imóvel atualizado com sucesso!'])
            ->response();
    }

    public function updateFoto(UpdateFotoImovelRequest $request, Imovel $imovel): JsonResponse
    {
        if ($imovel->foto && Storage::disk('public')->exists($imovel->foto)) {
            Storage::disk('public')->delete($imovel->foto);
        }

        $caminho = Storage::disk('public')->putFile('imoveis', $request->file('foto'));

        $imovel->update(['foto' => $caminho]);

        return response()->json([
            'message' => 'Foto do imóvel atualizada com sucesso!',
            'foto_url' => $imovel->refresh()->foto_url,
        ]);
    }

    public function destroy(Imovel $imovel): Response
    {
        $foto = $imovel->foto;

        $imovel->delete();

        if ($foto) {
            Storage::disk('public')->delete($foto);
        }

        return response()->noContent();
    }
}
