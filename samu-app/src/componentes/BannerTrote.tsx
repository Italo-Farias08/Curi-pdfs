import React, { useState } from 'react';
import { Image, ImageSourcePropType, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LARGURA_ORIGINAL = 1366;
const ALTURA_ORIGINAL = 200;
const RECORTE_X = 90;
const RECORTE_LARGURA = 560;

/** Versão do banner "Não brinque com quem salva vidas" pensada para o celular. */
export default function BannerTrote({ foto }: { foto: ImageSourcePropType }) {
  const [largura, setLargura] = useState(0);

  const aoMedir = (evento: LayoutChangeEvent) => setLargura(evento.nativeEvent.layout.width);

  const escala = largura / RECORTE_LARGURA;
  const alturaFoto = ALTURA_ORIGINAL * escala;

  return (
    <LinearGradient
      colors={['#FDB43A', '#F59A12', '#D96C06']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.caixa}
    >
      <View onLayout={aoMedir} style={{ width: '100%', height: alturaFoto, overflow: 'hidden' }}>
        {largura > 0 && (
          <Image
            source={foto}
            resizeMode="stretch"
            style={{
              position: 'absolute',
              left: -RECORTE_X * escala,
              top: 0,
              width: LARGURA_ORIGINAL * escala,
              height: alturaFoto,
            }}
          />
        )}
      </View>

      <View style={styles.texto}>
        <Text style={styles.titulo}>NÃO BRINQUE</Text>
        <View style={styles.faixa}>
          <Text style={styles.faixaTexto}>COM QUEM SALVA VIDAS</Text>
        </View>
        <View style={styles.aviso}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#fff" />
          <Text style={styles.avisoTexto}>Passar trote gera riscos e causa prejuízos</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  caixa: { width: '100%', overflow: 'hidden' },
  texto: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 22, alignItems: 'center', gap: 10 },
  titulo: {
    fontSize: 34,
    fontWeight: '900',
    color: '#B3081A',
    letterSpacing: 3,
    textAlign: 'center',
  },
  faixa: { backgroundColor: '#B3081A', paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'stretch' },
  faixaTexto: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avisoTexto: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
});