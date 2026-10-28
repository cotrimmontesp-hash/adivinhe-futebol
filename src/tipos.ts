export type TipoPergunta = 'jogador' | 'clube';

export type Nivel = 'facil' | 'medio' | 'dificil';

export type ItemQuiz = {
  id: string;
  tipo: TipoPergunta;
  nivel: Nivel;
  resposta: string;
  aceitas: string[];
  dicas: string[];
};
