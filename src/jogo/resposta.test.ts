import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { normalizarResposta, respostaConfere } from './resposta.ts';

test('normaliza acento, caixa e espaços', () => {
  assert.equal(normalizarResposta('  Pelé  '), 'pele');
  assert.equal(normalizarResposta('PELE'), 'pele');
  assert.equal(normalizarResposta('Edson   Arantes   do   Nascimento'), 'edson arantes do nascimento');
  assert.equal(normalizarResposta('São Paulo'), 'sao paulo');
  assert.equal(normalizarResposta('  Grêmio '), 'gremio');
  assert.equal(normalizarResposta('barça'), 'barca');
  assert.equal(normalizarResposta('ÁÉÍÓÚáéíóúÃÕãõÇç'), 'aeiouaeiouaoaocc');
  assert.equal(normalizarResposta('   '), '');
  assert.equal(normalizarResposta(''), '');
});

test('aceita a resposta oficial e as formas de aceitas', () => {
  const aceitas = ['cristiano ronaldo', 'cr7', 'cristiano'];
  assert.equal(respostaConfere('  CR7 ', 'Cristiano Ronaldo', aceitas), true);
  assert.equal(respostaConfere('Cristiano   Ronaldo', 'Cristiano Ronaldo', aceitas), true);
  assert.equal(respostaConfere('cristiano', 'Cristiano Ronaldo', aceitas), true);
  assert.equal(respostaConfere('ronaldo', 'Cristiano Ronaldo', aceitas), false);
  assert.equal(respostaConfere('Pelé', 'Pelé', ['pele']), true);
  assert.equal(respostaConfere('pele', 'Pelé', []), true);
  assert.equal(respostaConfere('', 'Pelé', ['pele']), false);
  assert.equal(respostaConfere('   ', 'Pelé', ['pele']), false);
  assert.equal(respostaConfere('mengao', 'Flamengo', ['mengão']), true);
  assert.equal(respostaConfere('mengão', 'Flamengo', ['mengão']), true);
});

test('cada resposta e cada forma aceita do banco conferem', () => {
  const bruto: unknown = JSON.parse(readFileSync(new URL('../data/dados.json', import.meta.url), 'utf8'));
  assert.ok(Array.isArray(bruto));
  const itens = bruto as {
    id: string;
    tipo: string;
    resposta: string;
    aceitas: string[];
    dicas: string[];
  }[];
  assert.equal(itens.length, 100);
  assert.equal(itens.filter((item) => item.tipo === 'jogador').length, 50);
  assert.equal(itens.filter((item) => item.tipo === 'clube').length, 50);
  const ids = new Set(itens.map((item) => item.id));
  assert.equal(ids.size, 100);
  for (const item of itens) {
    assert.equal(item.dicas.length, 5);
    assert.equal(respostaConfere(item.resposta, item.resposta, item.aceitas), true);
    for (const aceita of item.aceitas) {
      assert.equal(respostaConfere(aceita, item.resposta, item.aceitas), true, aceita);
    }
  }
});
