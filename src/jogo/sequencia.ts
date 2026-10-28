export type Sequencia = {
  atual: number;
  maior: number;
};

export const SEQUENCIA_INICIAL: Sequencia = { atual: 0, maior: 0 };

/** Acertar soma 1. Errar, desistir ou zerar o tempo volta a atual para 0 e preserva a maior. */
export function atualizarSequencia(sequenciaAtual: number, maior: number, acertou: boolean): Sequencia {
  if (!acertou) {
    return { atual: 0, maior };
  }
  const atual = sequenciaAtual + 1;
  return { atual, maior: Math.max(maior, atual) };
}
