export type TipoPergunta = 'jogador' | 'clube';

export type ItemQuiz = {
  id: string;
  tipo: TipoPergunta;
  resposta: string;
  aceitas: string[];
  dicas: string[];
};
