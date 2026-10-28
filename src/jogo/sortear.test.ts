import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sortearRodada } from './sortear.ts';

type Item = { id: string; tipo: string };

function banco(jogadores: number, clubes: number): Item[] {
  const itens: Item[] = [];
  for (let i = 0; i < jogadores; i += 1) {
    itens.push({ id: `jogador-${i}`, tipo: 'jogador' });
  }
  for (let i = 0; i < clubes; i += 1) {
    itens.push({ id: `clube-${i}`, tipo: 'clube' });
  }
  return itens;
}

function semente(valor: number): () => number {
  let estado = valor >>> 0;
  return () => {
    estado = (1664525 * estado + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

test('sorteia 10 itens sem repetir e mistura jogadores e clubes', () => {
  const itens = banco(15, 15);
  const ordem = itens.map((item) => item.id).join(',');
  for (let rodada = 0; rodada < 20; rodada += 1) {
    const sorteados = sortearRodada(itens, 10, semente(rodada + 1));
    assert.equal(sorteados.length, 10);
    const ids = sorteados.map((item) => item.id);
    assert.equal(new Set(ids).size, 10);
    for (const id of ids) {
      assert.ok(itens.some((item) => item.id === id));
    }
    const tipos = new Set(sorteados.map((item) => item.tipo));
    assert.equal(tipos.size, 2);
  }
  assert.equal(itens.map((item) => item.id).join(','), ordem);
});

test('corrige um sorteio que sairia só com um tipo', () => {
  const itens = banco(3, 3);
  const sorteados = sortearRodada(itens, 2, () => 0.999);
  assert.equal(sorteados.length, 2);
  assert.equal(new Set(sorteados.map((item) => item.id)).size, 2);
  assert.equal(new Set(sorteados.map((item) => item.tipo)).size, 2);
});

test('recusa rodada maior que o banco', () => {
  assert.throws(() => sortearRodada(banco(2, 2), 5, () => 0), /suficientes/);
  assert.throws(() => sortearRodada(banco(2, 2), 0, () => 0), /ao menos/);
});
