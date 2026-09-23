<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Garante que toda rota api/* responde JSON (RNF-07 + issue #11).
 *
 * - Define Accept: application/json quando o cliente (Expo) não envia.
 * - Expo Go / fetch sem header continuam recebendo JSON + 422 em PT.
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/*') && ! $request->headers->has('Accept')) {
            $request->headers->set('Accept', 'application/json');
        }

        // Força header para que shouldRenderJsonWhen + ValidationException retornem JSON.
        if ($request->is('api/*')) {
            $request->headers->set('Accept', 'application/json');
        }

        return $next($request);
    }
}
