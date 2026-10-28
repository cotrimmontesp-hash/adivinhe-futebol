/** Tira acento, caixa e espaços extras para comparar a resposta. */
export function normalizarResposta(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * A resposta do jogador confere se, depois de normalizada, for igual
 * a alguma entrada de `aceitas` ou à `resposta` oficial.
 */
export function respostaConfere(
  digitada: string,
  resposta: string,
  aceitas: readonly string[],
): boolean {
  const normalizada = normalizarResposta(digitada);
  if (normalizada.length === 0) {
    return false;
  }
  if (normalizada === normalizarResposta(resposta)) {
    return true;
  }
  return aceitas.some((aceita) => normalizada === normalizarResposta(aceita));
}
