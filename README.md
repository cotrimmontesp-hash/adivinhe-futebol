# Adivinhe Futebol

Quiz offline de futebol: o app mostra dicas, da mais difícil à mais fácil, e você descobre qual é o jogador ou o clube. O banco local tem 100 perguntas (50 jogadores e 50 clubes). Cada rodada tem 10 perguntas. Quanto menos dicas usar, mais pontos você faz. Não precisa de cadastro nem de internet.

O nível (fácil, médio ou difícil) é o quanto o nome é conhecido para o torcedor brasileiro médio.
Ele não muda a pontuação: quanto menos dicas, mais pontos.

O recorde (melhor pontuação) fica só neste aparelho.

## Como rodar

```bash
npm install
npx expo start
```

Para gerar a versão web (pasta `dist`, usada na Vercel):

```bash
npx expo export -p web
```

Os testes unitários rodam com `npm test`.
