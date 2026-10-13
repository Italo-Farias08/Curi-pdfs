import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema/cores';

export default function Carregando({ mensagem }: { mensagem?: string }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={cores.vermelho} />
      {mensagem ? <Text style={styles.texto}>{mensagem}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
    gap: 12,
  },
  texto: { color: cores.textoSecundario, fontSize: 14 },
});
