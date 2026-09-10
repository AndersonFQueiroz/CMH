<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('imoveis', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->text('descricao')->nullable();
            $table->string('tipo', 20); // casa|apartamento|kitnet|comercial|terreno (validado no Form Request)
            $table->string('finalidade', 10); // venda|aluguel (validado no Form Request)
            $table->string('endereco', 200);
            $table->string('cidade', 100);
            $table->decimal('preco', 12, 2);
            $table->decimal('area_m2', 8, 2);
            $table->unsignedTinyInteger('quartos');
            $table->unsignedTinyInteger('banheiros');
            $table->unsignedTinyInteger('vagas')->default(0);
            $table->date('data_disponibilidade');
            $table->string('foto', 255)->nullable();
            $table->boolean('disponivel')->default(true);
            $table->string('contato_telefone', 20);
            $table->timestamps();

            $table->index('titulo');
            $table->index('cidade');
            $table->index('tipo');
            $table->index('finalidade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imoveis');
    }
};
