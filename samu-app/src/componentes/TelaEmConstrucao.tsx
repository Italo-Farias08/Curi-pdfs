import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../tema/cores';

export default function TelaEmConstrucao({ titulo }: { titulo: string }) {
  return (
    <View style={styles.centro}>
      <View style={styles.medalhao}>
        <MaterialCommunityIcons name="hammer-wrench" size={34} color={cores.azul} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>
        Este módulo ainda não está disponível no aplicativo. Enquanto isso, use o sistema pelo
        navegador.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: cores.fundo,
  },
  medalhao: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8EEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: { fontSize: 20, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  texto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
