import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ROTULO_SITUACAO } from '../utilitarios/checklist';
import type { Situacao } from '../tipos/checklist';

const TONS: Record<Situacao, { fundo: string; texto: string; ativo: string }> = {
  P: { fundo: '#DCFCE7', texto: '#15803D', ativo: '#22C55E' },
  Q: { fundo: '#FEF9C3', texto: '#A16207', ativo: '#EAB308' },
  F: { fundo: '#FFE4E6', texto: '#BE123C', ativo: '#F43F5E' },
};

interface Props {
  situacao: Situacao;
  atual: Situacao | undefined;
  aoPressionar: () => void;
}

export default function BotaoSituacao({ situacao, atual, aoPressionar }: Props) {
  const tom = TONS[situacao];
  const selecionado = atual === situacao;

  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={ROTULO_SITUACAO[situacao]}
      style={[styles.botao, { backgroundColor: selecionado ? tom.ativo : tom.fundo }]}
    >
      <Text style={[styles.letra, { color: selecionado ? '#fff' : tom.texto }]}>{situacao}</Text>
      <Text style={[styles.rotulo, { color: selecionado ? '#fff' : tom.texto }]}>
        {ROTULO_SITUACAO[situacao]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flex: 1,
    minHeight: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  letra: { fontSize: 20, fontWeight: '800' },
  rotulo: { fontSize: 11, marginTop: 1 },
});
