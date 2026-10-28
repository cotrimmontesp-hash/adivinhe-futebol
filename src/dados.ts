import dadosJson from './data/dados.json';
import type { ItemQuiz, Nivel, TipoPergunta } from './tipos';

function ehTipo(valor: unknown): valor is TipoPergunta {
  return valor === 'jogador' || valor === 'clube';
}

function ehNivel(valor: unknown): valor is Nivel {
  return valor === 'facil' || valor === 'medio' || valor === 'dificil';
}

function ehItem(valor: unknown): valor is ItemQuiz {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const item = valor as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    ehTipo(item.tipo) &&
    ehNivel(item.nivel) &&
    typeof item.resposta === 'string' &&
    item.resposta.length > 0 &&
    Array.isArray(item.aceitas) &&
    item.aceitas.every((aceita) => typeof aceita === 'string' && aceita.length > 0) &&
    Array.isArray(item.dicas) &&
    item.dicas.length === 5 &&
    item.dicas.every((dica) => typeof dica === 'string' && dica.length > 0)
  );
}

export function carregarItens(bruto: unknown): ItemQuiz[] {
  if (!Array.isArray(bruto)) {
    throw new Error('Banco de perguntas inválido.');
  }
  const itens = bruto.map((item, indice) => {
    if (!ehItem(item)) {
      throw new Error(`Pergunta inválida na posição ${indice}.`);
    }
    return item;
  });
  const ids = new Set(itens.map((item) => item.id));
  if (ids.size !== itens.length) {
    throw new Error('Há perguntas com id repetido.');
  }
  return itens;
}

export const itens: readonly ItemQuiz[] = carregarItens(dadosJson);
