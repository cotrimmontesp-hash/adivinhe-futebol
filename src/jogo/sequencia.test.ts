import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SEQUENCIA_INICIAL, atualizarSequencia } from './sequencia.ts';

test('aumenta a sequência ao acertar', () => {
  const um = atualizarSequencia(0, 0, true);
  assert.deepEqual(um, { atual: 1, maior: 1 });
  const dois = atualizarSequencia(um.atual, um.maior, true);
  assert.deepEqual(dois, { atual: 2, maior: 2 });
  const tres = atualizarSequencia(dois.atual, dois.maior, true);
  assert.deepEqual(tres, { atual: 3, maior: 3 });
});

test('errar, desistir ou zerar o tempo volta a zero e preserva a maior', () => {
  const tres = atualizarSequencia(2, 2, true);
  assert.deepEqual(atualizarSequencia(tres.atual, tres.maior, false), { atual: 0, maior: 3 });
  const deNovo = atualizarSequencia(0, 3, true);
  assert.deepEqual(atualizarSequencia(deNovo.atual, deNovo.maior, false), { atual: 0, maior: 3 });
  assert.deepEqual(atualizarSequencia(3, 3, false), { atual: 0, maior: 3 });
});

test('a maior sequência não cai quando a atual zera e depois sobe menos', () => {
  const quebrada = atualizarSequencia(4, 4, false);
  const um = atualizarSequencia(quebrada.atual, quebrada.maior, true);
  assert.deepEqual(um, { atual: 1, maior: 4 });
});

test('cada nova rodada recomeça do zero', () => {
  const rodada = atualizarSequencia(3, 5, true);
  assert.deepEqual(rodada, { atual: 4, maior: 5 });
  const nova = SEQUENCIA_INICIAL;
  assert.deepEqual(nova, { atual: 0, maior: 0 });
  assert.deepEqual(atualizarSequencia(nova.atual, nova.maior, true), { atual: 1, maior: 1 });
});
