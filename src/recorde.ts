import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_RECORDE = '@adivinhe-futebol/recorde';

export async function lerRecorde(): Promise<number> {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_RECORDE);
    if (valor === null) {
      return 0;
    }
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0) {
      return 0;
    }
    return Math.floor(numero);
  } catch {
    return 0;
  }
}

export async function salvarRecorde(pontos: number): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_RECORDE, String(Math.floor(pontos)));
  } catch {
    // Sem armazenamento o placar da rodada continua na tela.
  }
}
