const PONTOS_POR_DICAS: readonly number[] = [5, 4, 3, 2, 1];

/** Pontos se acertar com 1 a 5 dicas já reveladas. Errar ou desistir vale 0. */
export function pontosDaPergunta(dicasReveladas: number, acertou: boolean): number {
  if (!acertou || !Number.isInteger(dicasReveladas)) {
    return 0;
  }
  const pontos = PONTOS_POR_DICAS[dicasReveladas - 1];
  return pontos ?? 0;
}
