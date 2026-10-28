import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { itens } from '../dados';
import { useCronometroPergunta } from '../jogo/cronometro';
import { pontosDaPergunta } from '../jogo/pontos';
import { normalizarResposta, respostaConfere } from '../jogo/resposta';
import { TAMANHO_RODADA, sortearRodada } from '../jogo/sortear';
import { lerRecorde, salvarRecorde } from '../recorde';
import { CORES, textoBase } from '../tema';
import type { ItemQuiz, Nivel } from '../tipos';

type Fase = 'escolha' | 'jogando' | 'revelada' | 'fim';

const ROTULO_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

function rotuloTipo(tipo: ItemQuiz['tipo']): string {
  return tipo === 'jogador' ? 'Jogador' : 'Clube';
}

function rotuloNivel(nivel: Nivel): string {
  return ROTULO_NIVEL[nivel];
}

function textoPontos(pontos: number): string {
  return pontos === 1 ? '1 ponto' : `${pontos} pontos`;
}

export function Jogo() {
  const insets = useSafeAreaInsets();
  const rolagem = useRef<ScrollViewInstance>(null);
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [rodada, setRodada] = useState<ItemQuiz[]>([]);
  const [indice, setIndice] = useState(0);
  const [dicasVisiveis, setDicasVisiveis] = useState(1);
  const [pontos, setPontos] = useState(0);
  const [recorde, setRecorde] = useState(0);
  const [respostaDigitada, setRespostaDigitada] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const [ganhos, setGanhos] = useState(0);
  const [fase, setFase] = useState<Fase>('escolha');
  const [novoRecorde, setNovoRecorde] = useState(false);
  const faseRef = useRef<Fase>('escolha');
  const dicasRef = useRef(1);

  function mudarFase(nova: Fase) {
    faseRef.current = nova;
    setFase(nova);
  }

  useEffect(() => {
    let ativo = true;
    lerRecorde().then((valor) => {
      if (ativo) {
        setRecorde(valor);
      }
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    rolagem.current?.scrollTo({ y: 0, animated: false });
  }, [indice, fase]);

  const pergunta = rodada[indice];
  const total = rodada.length;
  const restante = useCronometroPergunta(fase === 'jogando', pergunta?.id, desistir);

  function revelarMaisUmaDica() {
    if (faseRef.current !== 'jogando' || pergunta === undefined) {
      return;
    }
    if (dicasRef.current >= pergunta.dicas.length) {
      return;
    }
    dicasRef.current += 1;
    setDicasVisiveis(dicasRef.current);
  }

  function responder() {
    if (faseRef.current !== 'jogando' || pergunta === undefined) {
      return;
    }
    if (normalizarResposta(respostaDigitada).length === 0) {
      setAviso('Digite uma resposta para tentar.');
      return;
    }
    if (!respostaConfere(respostaDigitada, pergunta.resposta, pergunta.aceitas)) {
      setAviso('Não é essa. Tente de novo.');
      return;
    }
    const pontosGanhos = pontosDaPergunta(dicasRef.current, true);
    setPontos((atual) => atual + pontosGanhos);
    setGanhos(pontosGanhos);
    setAviso(null);
    mudarFase('revelada');
    Keyboard.dismiss();
  }

  function desistir() {
    if (faseRef.current !== 'jogando') {
      return;
    }
    setGanhos(0);
    setAviso(null);
    mudarFase('revelada');
    Keyboard.dismiss();
  }

  function proxima() {
    if (faseRef.current !== 'revelada') {
      return;
    }
    faseRef.current = 'jogando';
    if (indice >= total - 1) {
      if (pontos > recorde) {
        setRecorde(pontos);
        setNovoRecorde(true);
        void salvarRecorde(pontos);
      } else {
        setNovoRecorde(false);
      }
      mudarFase('fim');
      return;
    }
    setIndice((atual) => atual + 1);
    dicasRef.current = 1;
    setDicasVisiveis(1);
    setRespostaDigitada('');
    setAviso(null);
    setGanhos(0);
    mudarFase('jogando');
  }

  function reiniciarPergunta() {
    setIndice(0);
    dicasRef.current = 1;
    setDicasVisiveis(1);
    setPontos(0);
    setRespostaDigitada('');
    setAviso(null);
    setGanhos(0);
    setNovoRecorde(false);
  }

  function comecar(escolhido: Nivel) {
    const pool = itens.filter((item) => item.nivel === escolhido);
    if (pool.length < TAMANHO_RODADA) {
      return;
    }
    setNivel(escolhido);
    setRodada(sortearRodada(pool, TAMANHO_RODADA));
    reiniciarPergunta();
    mudarFase('jogando');
  }

  function jogarDeNovo() {
    setRodada([]);
    setNivel(null);
    reiniciarPergunta();
    mudarFase('escolha');
  }

  if (fase === 'escolha') {
    return (
      <View style={estilos.tela}>
        <View style={[estilos.cabecalho, { paddingTop: insets.top + 12 }]}>
          <View style={estilos.cabecalhoMiolo}>
            <Text accessibilityRole="header" style={estilos.titulo}>
              Adivinhe Futebol
            </Text>
            <Text style={estilos.placarTexto}>Escolha o nível</Text>
          </View>
        </View>
        <ScrollView
          style={estilos.rolagem}
          contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + 28 }]}
        >
          <View style={estilos.bloco} testID="tela-escolha">
            <Text style={estilos.escolhaTexto}>
              O nível é o quanto o nome é conhecido. A pontuação não muda.
            </Text>
            <Botao
              rotulo="Fácil"
              onPress={() => comecar('facil')}
              variante="secundario"
              testID="botao-nivel-facil"
            />
            <View style={estilos.sugeridoBloco}>
              <Text style={estilos.sugerido}>Sugerido</Text>
              <Botao
                rotulo="Médio"
                onPress={() => comecar('medio')}
                variante="primario"
                testID="botao-nivel-medio"
                rotuloAcessivel="Médio, sugerido"
              />
            </View>
            <Botao
              rotulo="Difícil"
              onPress={() => comecar('dificil')}
              variante="secundario"
              testID="botao-nivel-dificil"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (nivel === null || itens.length < TAMANHO_RODADA || pergunta === undefined) {
    return (
      <View style={[estilos.tela, { paddingTop: insets.top }]}>
        <Text style={estilos.titulo}>Adivinhe Futebol</Text>
        <Text style={estilos.dicaTexto}>Não há perguntas suficientes para uma rodada.</Text>
      </View>
    );
  }

  const podeMaisDica = fase === 'jogando' && dicasVisiveis < pergunta.dicas.length;

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[estilos.cabecalho, { paddingTop: insets.top + 12 }]}>
        <View style={estilos.cabecalhoMiolo}>
          <Text accessibilityRole="header" style={estilos.titulo}>
            Adivinhe Futebol
          </Text>
          <Text style={estilos.nivelTexto} testID="nivel-partida">
            Nível {rotuloNivel(nivel)}
          </Text>
          {fase === 'fim' ? (
            <Text style={estilos.placarTexto}>Rodada encerrada</Text>
          ) : (
            <View style={estilos.placar}>
              <Text style={estilos.placarTexto} testID="placar-pergunta">
                Pergunta {indice + 1}/{total}
              </Text>
              <Text style={estilos.placarTexto} testID="placar-pontos">
                {textoPontos(pontos)}
              </Text>
            </View>
          )}
          {fase !== 'fim' ? <Text style={estilos.regra}>Menos dicas, mais pontos.</Text> : null}
        </View>
      </View>

      <ScrollView
        ref={rolagem}
        style={estilos.rolagem}
        contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
      >
        {fase === 'fim' ? (
          <View style={estilos.bloco} testID="tela-final">
            <Text style={estilos.fimRotulo}>Total da rodada</Text>
            <Text style={estilos.fimPontos}>{pontos}</Text>
            <Text style={estilos.fimUnidade}>{pontos === 1 ? 'ponto' : 'pontos'}</Text>
            <Text style={estilos.recorde}>Recorde: {textoPontos(recorde)}</Text>
            {novoRecorde ? <Text style={estilos.novoRecorde}>Novo recorde!</Text> : null}
            <Botao rotulo="Jogar de novo" onPress={jogarDeNovo} variante="primario" testID="botao-jogar-de-novo" />
          </View>
        ) : (
          <View style={estilos.bloco}>
            <Text
              style={[estilos.tempo, restante <= 5 ? estilos.tempoUrgente : null]}
              testID="cronometro"
            >
              Tempo: {restante}s
            </Text>
            <Text style={estilos.tipo}>{rotuloTipo(pergunta.tipo)}</Text>

            {fase === 'revelada' ? (
              <View style={estilos.resultado} testID="resultado">
                <Text style={estilos.resultadoTitulo}>
                  {ganhos > 0
                    ? `Acertou com ${dicasVisiveis} ${dicasVisiveis === 1 ? 'dica' : 'dicas'}. ${textoPontos(ganhos)}.`
                    : 'Você desistiu. 0 pontos.'}
                </Text>
                <Text style={estilos.dicaRotulo}>Resposta</Text>
                <Text style={estilos.resultadoNome} testID="resposta-correta">
                  {pergunta.resposta}
                </Text>
                <Botao rotulo="Próxima" onPress={proxima} variante="primario" testID="botao-proxima" />
              </View>
            ) : null}

            {pergunta.dicas.slice(0, dicasVisiveis).map((dica, indiceDica) => (
              <View key={`${pergunta.id}-${indiceDica}`} style={estilos.dica}>
                <Text style={estilos.dicaRotulo}>Dica {indiceDica + 1}</Text>
                <Text style={estilos.dicaTexto} testID={`dica-${indiceDica}`}>
                  {dica}
                </Text>
              </View>
            ))}

            {fase === 'jogando' ? (
              <View style={estilos.acoes}>
                {podeMaisDica ? (
                  <Botao
                    rotulo="Mais uma dica"
                    onPress={revelarMaisUmaDica}
                    variante="secundario"
                    testID="botao-mais-dica"
                  />
                ) : null}
                <TextInput
                  value={respostaDigitada}
                  onChangeText={(texto) => {
                    setRespostaDigitada(texto);
                    if (aviso !== null) {
                      setAviso(null);
                    }
                  }}
                  onSubmitEditing={responder}
                  placeholder="Digite o nome"
                  placeholderTextColor={CORES.textoSuave}
                  style={estilos.campo}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  returnKeyType="done"
                  blurOnSubmit
                  accessibilityLabel="Sua resposta"
                  testID="campo-resposta"
                />
                {aviso !== null ? (
                  <Text style={estilos.aviso} accessibilityLiveRegion="polite" testID="aviso">
                    {aviso}
                  </Text>
                ) : null}
                <Botao rotulo="Responder" onPress={responder} variante="primario" testID="botao-responder" />
                <Botao rotulo="Desistir" onPress={desistir} variante="discreto" testID="botao-desistir" />
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Botao(props: {
  rotulo: string;
  onPress: () => void;
  variante: 'primario' | 'secundario' | 'discreto';
  testID: string;
  rotuloAcessivel?: string;
}) {
  const estilo =
    props.variante === 'primario'
      ? estilos.botaoPrimario
      : props.variante === 'secundario'
        ? estilos.botaoSecundario
        : estilos.botaoDiscreto;
  const estiloTexto =
    props.variante === 'primario'
      ? estilos.botaoPrimarioTexto
      : props.variante === 'secundario'
        ? estilos.botaoSecundarioTexto
        : estilos.botaoDiscretoTexto;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.rotuloAcessivel ?? props.rotulo}
      onPress={props.onPress}
      testID={props.testID}
      style={({ pressed }) => [estilo, pressed ? estilos.botaoPressionado : null]}
    >
      <Text style={estiloTexto}>{props.rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  cabecalho: {
    backgroundColor: CORES.verde,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  cabecalhoMiolo: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: 6,
  },
  titulo: {
    ...textoBase,
    color: CORES.textoClaro,
    fontSize: 28,
    fontWeight: '700',
  },
  placar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  placarTexto: {
    ...textoBase,
    color: CORES.textoClaro,
    fontSize: 20,
    fontWeight: '700',
  },
  regra: {
    ...textoBase,
    color: '#e7f5ec',
    fontSize: 16,
  },
  nivelTexto: {
    ...textoBase,
    color: '#e7f5ec',
    fontSize: 15,
    fontWeight: '600',
  },
  escolhaTexto: {
    ...textoBase,
    fontSize: 18,
    lineHeight: 26,
  },
  sugeridoBloco: {
    gap: 6,
  },
  sugerido: {
    ...textoBase,
    color: CORES.verdeEscuro,
    fontSize: 14,
    fontWeight: '700',
  },
  rolagem: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bloco: {
    gap: 14,
  },
  tempo: {
    ...textoBase,
    fontSize: 18,
    fontWeight: '700',
  },
  tempoUrgente: {
    color: CORES.aviso,
  },
  tipo: {
    ...textoBase,
    alignSelf: 'flex-start',
    backgroundColor: CORES.verde,
    color: CORES.textoClaro,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  dica: {
    backgroundColor: CORES.cartao,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: CORES.linha,
  },
  dicaRotulo: {
    ...textoBase,
    color: CORES.verdeEscuro,
    fontSize: 15,
    fontWeight: '700',
  },
  dicaTexto: {
    ...textoBase,
    fontSize: 22,
    lineHeight: 32,
  },
  acoes: {
    gap: 12,
    marginTop: 4,
  },
  campo: {
    ...textoBase,
    backgroundColor: CORES.cartao,
    borderWidth: 2,
    borderColor: CORES.verde,
    borderRadius: 16,
    minHeight: 64,
    paddingHorizontal: 16,
    fontSize: 22,
  },
  aviso: {
    ...textoBase,
    color: CORES.aviso,
    fontSize: 18,
    fontWeight: '700',
  },
  resultado: {
    backgroundColor: '#e7f5ec',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: CORES.verde,
  },
  resultadoTitulo: {
    ...textoBase,
    fontSize: 18,
    fontWeight: '700',
    color: CORES.verdeEscuro,
  },
  resultadoNome: {
    ...textoBase,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  fimRotulo: {
    ...textoBase,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  fimPontos: {
    ...textoBase,
    fontSize: 72,
    lineHeight: 80,
    fontWeight: '700',
    textAlign: 'center',
    color: CORES.verdeEscuro,
  },
  fimUnidade: {
    ...textoBase,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  recorde: {
    ...textoBase,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  novoRecorde: {
    ...textoBase,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
    color: CORES.verdeEscuro,
  },
  botaoPrimario: {
    backgroundColor: CORES.verde,
    minHeight: 60,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  botaoPrimarioTexto: {
    ...textoBase,
    color: CORES.textoClaro,
    fontSize: 20,
    fontWeight: '700',
  },
  botaoSecundario: {
    backgroundColor: CORES.cartao,
    minHeight: 60,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: CORES.verde,
  },
  botaoSecundarioTexto: {
    ...textoBase,
    color: CORES.verdeEscuro,
    fontSize: 20,
    fontWeight: '700',
  },
  botaoDiscreto: {
    minHeight: 56,
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  botaoDiscretoTexto: {
    ...textoBase,
    color: CORES.textoSuave,
    fontSize: 18,
    fontWeight: '700',
  },
  botaoPressionado: {
    opacity: 0.82,
  },
});
