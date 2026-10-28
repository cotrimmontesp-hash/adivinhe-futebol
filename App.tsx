import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Jogo } from './src/tela/Jogo';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Jogo />
    </SafeAreaProvider>
  );
}
