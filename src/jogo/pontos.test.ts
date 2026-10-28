import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pontosDaPergunta } from './pontos.ts';

test('pontua conforme o número de dicas reveladas', () => {
  assert.equal(pontosDaPergunta(1, true), 5);
  assert.equal(pontosDaPergunta(2, true), 4);
  assert.equal(pontosDaPergunta(3, true), 3);
  assert.equal(pontosDaPergunta(4, true), 2);
  assert.equal(pontosDaPergunta(5, true), 1);
});

test('errar, desistir ou usar um número inválido de dicas vale zero', () => {
  assert.equal(pontosDaPergunta(1, false), 0);
  assert.equal(pontosDaPergunta(5, false), 0);
  assert.equal(pontosDaPergunta(0, true), 0);
  assert.equal(pontosDaPergunta(6, true), 0);
  assert.equal(pontosDaPergunta(1.5, true), 0);
});
