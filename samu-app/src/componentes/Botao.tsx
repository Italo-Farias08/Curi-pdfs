import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, raios } from '../tema/cores';
import { ToqueMola } from './Animados';

type Variante = 'primario' | 'secundario' | 'perigo';

interface Props {
  titulo: string;
  aoPressionar: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: Variante;
  estilo?: ViewStyle;
}

export default function Botao({
  titulo,
  aoPressionar,
  carregando = false,
  desabilitado = false,
  variante = 'primario',
  estilo,
}: Props) {
  const inativo = desabilitado || carregando;

  if (variante === 'primario') {
    return (
      <ToqueMola
        onPress={aoPressionar}
        disabled={inativo}
        accessibilityRole="button"
        estilo={[styles.base, estilo as ViewStyle, { opacity: inativo ? 0.6 : 1 }]}
      >
        <LinearGradient
          colors={['#E30613', '#A0081D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradiente}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoClaro}>{titulo}</Text>
          )}
        </LinearGradient>
      </ToqueMola>
    );
  }

  const ehPerigo = variante === 'perigo';

  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles.contorno,
        { borderColor: ehPerigo ? cores.vermelho : cores.borda },
        estilo,
        { opacity: inativo ? 0.55 : pressed ? 0.8 : 1 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cores.vermelho} />
      ) : (
        <Text style={[styles.texto, { color: ehPerigo ? cores.vermelho : cores.texto }]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: raios.md,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gradiente: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contorno: {
    borderWidth: 1.5,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: cores.superficie,
  },
  textoClaro: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  texto: { fontSize: 16, fontWeight: '600' },
});