import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { DURACAO_PERGUNTA_SEGUNDOS, iniciarCronometro } from './cronometro.ts';

afterEach(() => {
  mock.timers.reset();
});

function ligarRelogio(): void {
  mock.timers.enable({ apis: ['setInterval'] });
}

test('a contagem começa em 30, diminui e reinicia na pergunta seguinte', () => {
  ligarRelogio();
  const primeira: number[] = [];
  const controle = iniciarCronometro({
    aoTick: (restante) => primeira.push(restante),
    aoZerar: () => {},
  });
  assert.equal(DURACAO_PERGUNTA_SEGUNDOS, 30);
  assert.equal(primeira[0], 30);
  mock.timers.tick(1000);
  assert.equal(primeira.at(-1), 29);
  mock.timers.tick(2000);
  assert.equal(primeira.at(-1), 27);
  controle.parar();
  const tamanho = primeira.length;
  mock.timers.tick(5000);
  assert.equal(primeira.length, tamanho);

  const segunda: number[] = [];
  iniciarCronometro({
    aoTick: (restante) => segunda.push(restante),
    aoZerar: () => {},
  });
  assert.deepEqual(segunda, [30]);
  mock.timers.tick(1000);
  assert.equal(segunda.at(-1), 29);
});

test('para ao responder e o tempo não chega a zerar', () => {
  ligarRelogio();
  let zerou = 0;
  const ticks: number[] = [];
  const controle = iniciarCronometro({
    aoTick: (restante) => ticks.push(restante),
    aoZerar: () => {
      zerou += 1;
    },
  });
  mock.timers.tick(4000);
  assert.equal(ticks.at(-1), 26);
  controle.parar();
  mock.timers.tick(60_000);
  assert.equal(zerou, 0);
  assert.equal(ticks.at(-1), 26);
});

test('ao zerar dispara o fim da pergunta uma única vez', () => {
  ligarRelogio();
  let zerou = 0;
  const ticks: number[] = [];
  iniciarCronometro({
    aoTick: (restante) => ticks.push(restante),
    aoZerar: () => {
      zerou += 1;
    },
  });
  mock.timers.tick(29_000);
  assert.equal(ticks.at(-1), 1);
  assert.equal(zerou, 0);
  mock.timers.tick(1000);
  assert.equal(ticks.at(-1), 0);
  assert.equal(zerou, 1);
  mock.timers.tick(10_000);
  assert.equal(zerou, 1);
});
