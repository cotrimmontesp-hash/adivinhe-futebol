export const TAMANHO_RODADA = 10;

export type ItemSorteavel = {
  id: string;
  tipo: string;
};

function indiceAleatorio(limiteInclusivo: number, aleatorio: () => number): number {
  const valor = aleatorio();
  const fracao = Number.isFinite(valor) ? Math.min(Math.max(valor, 0), 0.999999999) : 0;
  return Math.floor(fracao * (limiteInclusivo + 1));
}

function embaralhar<T>(lista: readonly T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = indiceAleatorio(i, aleatorio);
    const atual = copia[i];
    const outro = copia[j];
    if (atual === undefined || outro === undefined) {
      continue;
    }
    copia[i] = outro;
    copia[j] = atual;
  }
  return copia;
}

function comMistura<T extends ItemSorteavel>(
  selecionados: readonly T[],
  universo: readonly T[],
): T[] {
  const resultado = [...selecionados];
  if (resultado.length < 2) {
    return resultado;
  }
  const tiposNoUniverso = new Set(universo.map((item) => item.tipo));
  if (tiposNoUniverso.size < 2) {
    return resultado;
  }
  const tiposSelecionados = new Set(resultado.map((item) => item.tipo));
  if (tiposSelecionados.size >= 2) {
    return resultado;
  }
  const tipoAtual = resultado[0]?.tipo;
  const ids = new Set(resultado.map((item) => item.id));
  const substituto = universo.find((item) => item.tipo !== tipoAtual && !ids.has(item.id));
  const ultimo = resultado.length - 1;
  if (substituto !== undefined && resultado[ultimo] !== undefined) {
    resultado[ultimo] = substituto;
  }
  return resultado;
}

/** Sorteia uma rodada sem repetir id. Com os dois tipos no banco, a rodada mistura os dois. */
export function sortearRodada<T extends ItemSorteavel>(
  itens: readonly T[],
  quantidade: number,
  aleatorio: () => number = Math.random,
): T[] {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error('A rodada precisa de ao menos uma pergunta.');
  }
  if (quantidade > itens.length) {
    throw new Error('Não há itens suficientes para a rodada.');
  }
  const ids = new Set<string>();
  for (const item of itens) {
    if (ids.has(item.id)) {
      throw new Error('Há itens com id repetido.');
    }
    ids.add(item.id);
  }
  const embaralhados = embaralhar(itens, aleatorio);
  return comMistura(embaralhados.slice(0, quantidade), embaralhados);
}
