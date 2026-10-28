import { useEffect, useRef, useState } from 'react';

export const DURACAO_PERGUNTA_SEGUNDOS = 30;

type Agendar = (callback: () => void, intervaloMs: number) => ReturnType<typeof setInterval>;
type Cancelar = (id: ReturnType<typeof setInterval>) => void;

/**
 * Contagem regressiva de uma pergunta. O primeiro aviso é o tempo cheio;
 * a cada segundo diminui 1. Ao zerar, dispara o fim uma vez e para.
 */
export function iniciarCronometro(opcoes: {
  aoTick: (restante: number) => void;
  aoZerar: () => void;
  duracaoSegundos?: number;
  agendar?: Agendar;
  cancelar?: Cancelar;
}): { parar: () => void } {
  const duracao = opcoes.duracaoSegundos ?? DURACAO_PERGUNTA_SEGUNDOS;
  const agendar = opcoes.agendar ?? setInterval;
  const cancelar = opcoes.cancelar ?? clearInterval;
  let restante = duracao;
  let encerrado = false;
  opcoes.aoTick(restante);
  const id = agendar(() => {
    if (encerrado) {
      return;
    }
    restante -= 1;
    if (restante > 0) {
      opcoes.aoTick(restante);
      return;
    }
    restante = 0;
    encerrado = true;
    cancelar(id);
    opcoes.aoTick(0);
    opcoes.aoZerar();
  }, 1000);
  return {
    parar() {
      if (encerrado) {
        return;
      }
      encerrado = true;
      cancelar(id);
    },
  };
}

/** Reinicia ao trocar a pergunta e limpa o intervalo ao parar ou desmontar. */
export function useCronometroPergunta(
  ativo: boolean,
  perguntaId: string | undefined,
  aoZerar: () => void,
): number {
  const [restante, setRestante] = useState(DURACAO_PERGUNTA_SEGUNDOS);
  const aoZerarRef = useRef(aoZerar);
  aoZerarRef.current = aoZerar;
  const perguntaAnterior = useRef<string | undefined>(undefined);

  if (ativo && perguntaId !== undefined && perguntaId !== perguntaAnterior.current) {
    perguntaAnterior.current = perguntaId;
    if (restante !== DURACAO_PERGUNTA_SEGUNDOS) {
      setRestante(DURACAO_PERGUNTA_SEGUNDOS);
    }
  }

  useEffect(() => {
    if (!ativo || perguntaId === undefined) {
      return;
    }
    const controle = iniciarCronometro({
      aoTick: setRestante,
      aoZerar: () => aoZerarRef.current(),
    });
    return () => controle.parar();
  }, [ativo, perguntaId]);

  return restante;
}
