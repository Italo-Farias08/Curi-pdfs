import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { categorias, cores, raios } from '../tema/cores';
import type { ServicoDoInicio } from '../dados/servicos';

interface Props {
  servico: ServicoDoInicio;
  aoPressionar: () => void;
}

export default function CartaoServico({ servico, aoPressionar }: Props) {
  const tom = categorias[servico.categoria];

  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={servico.titulo}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
    >
      <View style={[styles.iconeCaixa, { backgroundColor: tom.fundo }]}>
        <MaterialCommunityIcons name={servico.icone} size={28} color={tom.icone} />
      </View>
      <Text style={styles.titulo} numberOfLines={2}>
        {servico.titulo}
      </Text>
      <Text style={styles.rotulo} numberOfLines={1}>
        {servico.rotulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    minHeight: 124,
  },
  pressionado: { backgroundColor: '#F7F9FC', transform: [{ scale: 0.98 }] },
  iconeCaixa: {
    width: 48,
    height: 48,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titulo: { fontSize: 14, fontWeight: '700', color: cores.texto },
  rotulo: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
});
