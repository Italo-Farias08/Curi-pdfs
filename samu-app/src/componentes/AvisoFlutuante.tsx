import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../tema/cores';

export interface MensagemAviso {
  texto: string;
  tipo: 'sucesso' | 'erro';
  chave: number;
}

/** Faixa que desce do topo e some sozinha depois de alguns segundos. */
export default function AvisoFlutuante({ mensagem }: { mensagem: MensagemAviso | null }) {
  const valor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mensagem) return;
    valor.setValue(0);
    Animated.sequence([
      Animated.spring(valor, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }),
      Animated.delay(2800),
      Animated.timing(valor, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [mensagem, valor]);

  if (!mensagem) return null;
  const erro = mensagem.tipo === 'erro';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.faixa,
        { backgroundColor: erro ? cores.erro : cores.sucesso },
        {
          opacity: valor,
          transform: [{ translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
        },
      ]}
    >
      <MaterialCommunityIcons name={erro ? 'alert-circle' : 'check-circle'} size={20} color="#fff" />
      <Text style={styles.texto}>{mensagem.texto}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  faixa: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  texto: { color: '#fff', fontWeight: '700', flex: 1, fontSize: 14 },
});