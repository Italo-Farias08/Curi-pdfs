import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessaoProvedor } from './src/contextos/SessaoContexto';
import Navegador from './src/navegacao/Navegador';

export default function App() {
  return (
    <SafeAreaProvider>
      <SessaoProvedor>
        <Navegador />
      </SessaoProvedor>
    </SafeAreaProvider>
  );
}
