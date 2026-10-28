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

function gruposPorTipo<T extends ItemSorteavel>(itens: readonly T[]): T[][] {
  const porTipo = new Map<string, T[]>();
  for (const item of itens) {
    const grupo = porTipo.get(item.tipo);
    if (grupo === undefined) {
      porTipo.set(item.tipo, [item]);
    } else {
      grupo.push(item);
    }
  }
  return [...porTipo.values()];
}

/** Reparte a rodada o mais perto possível entre os tipos, sem passar do que cada um tem. */
function cotasEquilibradas(tamanhos: readonly number[], quantidade: number, aleatorio: () => number): number[] {
  const cotas = tamanhos.map(() => 0);
  let restante = quantidade;
  const base = Math.floor(quantidade / tamanhos.length);
  for (let i = 0; i < tamanhos.length; i += 1) {
    const cota = Math.min(base, tamanhos[i] ?? 0);
    cotas[i] = cota;
    restante -= cota;
  }
  const ordem = embaralhar(
    tamanhos.map((_, indice) => indice),
    aleatorio,
  );
  while (restante > 0) {
    let avancou = false;
    for (const indice of ordem) {
      if (restante === 0) {
        break;
      }
      const tamanho = tamanhos[indice] ?? 0;
      const atual = cotas[indice] ?? 0;
      if (atual < tamanho) {
        cotas[indice] = atual + 1;
        restante -= 1;
        avancou = true;
      }
    }
    if (!avancou) {
      break;
    }
  }
  return cotas;
}

/** Sorteia uma rodada sem repetir id. Com os dois tipos no banco, a rodada mistura e equilibra os dois. */
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

  const grupos = gruposPorTipo(itens).map((grupo) => embaralhar(grupo, aleatorio));
  if (grupos.length < 2) {
    return embaralhar(itens, aleatorio).slice(0, quantidade);
  }

  const cotas = cotasEquilibradas(
    grupos.map((grupo) => grupo.length),
    quantidade,
    aleatorio,
  );
  const selecionados: T[] = [];
  grupos.forEach((grupo, indice) => {
    selecionados.push(...grupo.slice(0, cotas[indice] ?? 0));
  });
  return embaralhar(selecionados, aleatorio);
}
