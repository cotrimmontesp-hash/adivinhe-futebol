import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { normalizarResposta } from './resposta.ts';

type ItemBanco = {
  id: string;
  tipo: string;
  nivel: string;
  resposta: string;
  aceitas: string[];
  dicas: string[];
};

function carregarBanco(): ItemBanco[] {
  const bruto: unknown = JSON.parse(readFileSync(new URL('../data/dados.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(bruto));
  return bruto as ItemBanco[];
}

test('o banco tem 100 itens, metade jogadores e metade clubes, com ids únicos', () => {
  const itens = carregarBanco();
  assert.equal(itens.length, 100);
  assert.equal(itens.filter((item) => item.tipo === 'jogador').length, 50);
  assert.equal(itens.filter((item) => item.tipo === 'clube').length, 50);
  const ids = itens.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.equal(id.trim().length > 0, true);
  }
});

test('cada item tem resposta, aceitas e exatamente 5 dicas não vazias', () => {
  for (const item of carregarBanco()) {
    assert.equal(typeof item.resposta, 'string', item.id);
    assert.equal(item.resposta.trim().length > 0, true, item.id);
    assert.ok(Array.isArray(item.aceitas), item.id);
    assert.ok(item.aceitas.length > 0, item.id);
    for (const aceita of item.aceitas) {
      assert.equal(typeof aceita, 'string', item.id);
      assert.equal(aceita.trim().length > 0, true, item.id);
    }
    assert.ok(Array.isArray(item.dicas), item.id);
    assert.equal(item.dicas.length, 5, item.id);
    for (const dica of item.dicas) {
      assert.equal(typeof dica, 'string', item.id);
      assert.equal(dica.trim().length > 0, true, item.id);
    }
  }
});

test('nenhuma resposta aceita, já normalizada, se repete em outro item', () => {
  const vistas = new Map<string, string>();
  for (const item of carregarBanco()) {
    const formas = new Set([item.resposta, ...item.aceitas].map((forma) => normalizarResposta(forma)));
    for (const forma of formas) {
      assert.equal(forma.length > 0, true, item.id);
      const outro = vistas.get(forma);
      assert.equal(outro, undefined, `"${forma}" em ${item.id} e ${outro ?? ''}`);
      vistas.set(forma, item.id);
    }
  }
});

test('cada item tem nivel válido, nas contagens 30, 42 e 28', () => {
  const itens = carregarBanco();
  const niveis = ['facil', 'medio', 'dificil'] as const;
  for (const item of itens) {
    assert.ok(niveis.includes(item.nivel as (typeof niveis)[number]), item.id);
  }
  assert.equal(itens.filter((item) => item.nivel === 'facil').length, 30);
  assert.equal(itens.filter((item) => item.nivel === 'medio').length, 42);
  assert.equal(itens.filter((item) => item.nivel === 'dificil').length, 28);
  for (const nivel of niveis) {
    const doNivel = itens.filter((item) => item.nivel === nivel);
    assert.ok(doNivel.filter((item) => item.tipo === 'jogador').length >= 5, nivel);
    assert.ok(doNivel.filter((item) => item.tipo === 'clube').length >= 5, nivel);
  }
});

test('nenhuma dica contém a resposta normalizada', () => {
  for (const item of carregarBanco()) {
    const resposta = normalizarResposta(item.resposta);
    assert.equal(resposta.length > 0, true, item.id);
    for (const dica of item.dicas) {
      assert.equal(normalizarResposta(dica).includes(resposta), false, `${item.id}: ${dica}`);
    }
  }
});
