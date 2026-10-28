import { Platform, type TextStyle } from 'react-native';

export const CORES = {
  verde: '#146c43',
  verdeEscuro: '#0e5434',
  verdePressionado: '#0c4a2e',
  fundo: '#f3f6ef',
  cartao: '#ffffff',
  texto: '#14241c',
  textoClaro: '#ffffff',
  textoSuave: '#3d5248',
  aviso: '#8c1d1d',
  linha: '#d5e3d8',
} as const;

export const fonte: string =
  Platform.select({
    android: 'sans-serif',
    ios: 'System',
    default: 'system-ui, sans-serif',
  }) ?? 'sans-serif';

export const textoBase: TextStyle = {
  fontFamily: fonte,
  color: CORES.texto,
};
