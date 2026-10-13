import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores } from '../tema/cores';
import type { NomeIcone } from '../dados/servicos';

interface Props {
  titulo: string;
  subtitulo?: string;
  aoVoltar?: () => void;
  iconeAcao?: NomeIcone;
  rotuloAcao?: string;
  aoAcionar?: () => void;
}

export default function Cabecalho({
  titulo,
  subtitulo,
  aoVoltar,
  iconeAcao,
  rotuloAcao,
  aoAcionar,
}: Props) {
  const margens = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={cores.gradiente}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.caixa, { paddingTop: margens.top + 12 }]}
    >
      <StatusBar style="light" />
      <View style={styles.linha}>
        {aoVoltar && (
          <Pressable
            onPress={aoVoltar}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.botaoIcone}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
        )}
        <View style={styles.textos}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          {subtitulo ? (
            <Text style={styles.subtitulo} numberOfLines={2}>
              {subtitulo}
            </Text>
          ) : null}
        </View>
        {iconeAcao && aoAcionar && (
          <Pressable
            onPress={aoAcionar}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={rotuloAcao}
            style={styles.botaoIcone}
          >
            <MaterialCommunityIcons name={iconeAcao} size={24} color="#fff" />
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  caixa: { paddingHorizontal: 16, paddingBottom: 18 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  textos: { flex: 1 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitulo: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 2 },
});
