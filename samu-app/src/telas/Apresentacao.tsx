import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import BannerTrote from '../componentes/BannerTrote';
import { Eletrocardiograma, Entrada, Ondas, ToqueMola } from '../componentes/Animados';
import clienteHttp from '../servicos/clienteHttp';
import { imagensApresentacao } from '../dados/imagensApresentacao';
import { cores, raios } from '../tema/cores';
import type { ParametrosAutenticacao } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosAutenticacao, 'Apresentacao'>;

interface BaseSamu {
  id?: number;
  titulo: string;
}

const TEXTO_INSTITUCIONAL =
  'O SAMU 192 é um serviço público e gratuito, disponível 24 horas por dia, que atende ' +
  'solicitações de urgência médica realizadas pelo número 192. Os chamados são direcionados ' +
  'à Central de Regulação Médica das Urgências, onde profissionais capacitados realizam o ' +
  'acolhimento e organizam o atendimento conforme a necessidade de cada caso.';

export default function Apresentacao({ navigation }: Props) {
  const margens = useSafeAreaInsets();
  const [bases, setBases] = useState<BaseSamu[]>([]);

  const zoom = useRef(new Animated.Value(0)).current;
  const flutuar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const respirar = Animated.loop(
      Animated.sequence([
        Animated.timing(zoom, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(zoom, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const subir = Animated.loop(
      Animated.sequence([
        Animated.timing(flutuar, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flutuar, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    respirar.start();
    subir.start();
    return () => {
      respirar.stop();
      subir.stop();
    };
  }, [zoom, flutuar]);

  // Bases (equipes SAMU) cadastradas — mesma fonte pública usada pelo site.
  useEffect(() => {
    clienteHttp
      .get('/configuracao-base/publicas')
      .then(({ data }) => setBases(Array.isArray(data) ? (data as BaseSamu[]) : []))
      .catch(() => setBases([]));
  }, []);

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0B1633', '#1a2c5b', '#8E1B2D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {imagensApresentacao.fundo ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] },
          ]}
        >
          <ImageBackground
            source={imagensApresentacao.fundo}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </Animated.View>
      ) : null}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,22,51,0)' }]} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: margens.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroConteudo, { paddingTop: margens.top + 16 }]}>
          <Entrada deslocamento={-12} estilo={styles.selo}>
            <View style={styles.seloPonto} />
            <Text style={styles.seloTexto}>ATENDIMENTO 24 HORAS</Text>
          </Entrada>

          <Entrada atraso={120} deslocamento={30}>
            <Animated.View
              style={[
                styles.logoArea,
                { transform: [{ translateY: flutuar.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) }] },
              ]}
            >
              <Ondas tamanho={130} />
              <Image source={require('../../assets/logo-samu.png')} style={styles.logo} resizeMode="contain" />
            </Animated.View>
          </Entrada>
        </View>

        <View style={styles.conteudo}>
          <Entrada atraso={260} estilo={styles.centro}>
            <Text style={styles.sigla}>SAMU</Text>
            <Text style={styles.numero}>192</Text>
          </Entrada>

          <Entrada atraso={380} estilo={styles.centro}>
            <Text style={styles.titulo}>Serviço de Atendimento Móvel de Urgência</Text>
            <View style={{ marginTop: 14 }}>
              <Eletrocardiograma />
            </View>
          </Entrada>

          <Entrada atraso={500}>
            <View style={styles.cartaoTexto}>
              <Text style={styles.texto}>{TEXTO_INSTITUCIONAL}</Text>
            </View>
          </Entrada>

          {imagensApresentacao.banner ? (
            <Entrada atraso={600} estilo={styles.bannerLargo}>
              <BannerTrote foto={imagensApresentacao.banner} />
            </Entrada>
          ) : null}

          {bases.length > 0 && (
            <Entrada atraso={680}>
              <Text style={styles.secao}>Equipes SAMU</Text>
              <View style={styles.chips}>
                {bases.map((base, indice) => (
                  <View key={base.id ?? indice} style={styles.chip}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={cores.laranja} />
                    <Text style={styles.chipTexto}>{base.titulo}</Text>
                  </View>
                ))}
              </View>
            </Entrada>
          )}

          <Entrada atraso={760} estilo={styles.acoes}>
            <ToqueMola
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              estilo={styles.botaoEntrar}
            >
              <Text style={styles.botaoEntrarTexto}>Entrar no sistema</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </ToqueMola>

            <ToqueMola
              onPress={() => Linking.openURL('tel:192')}
              accessibilityRole="button"
              accessibilityLabel="Ligar para o 192"
              estilo={styles.botaoLigar}
            >
              <MaterialCommunityIcons name="phone" size={18} color="#fff" />
              <Text style={styles.botaoLigarTexto}>Emergência? Ligue 192</Text>
            </ToqueMola>
          </Entrada>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#0B1633' },
  hero: { width: '100%', overflow: 'hidden' },
  heroConteudo: { flex: 1, alignItems: 'center', gap: 18 },
  conteudo: { paddingHorizontal: 24, gap: 18, alignItems: 'stretch', marginTop: 4 },
  bannerLargo: { marginHorizontal: -24, backgroundColor: 'rgba(255,255,255,0.04)' },
  ampliar: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  ampliarTexto: { color: '#fff', fontSize: 10, fontWeight: '600' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center' },
  fechar: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { alignItems: 'center' },
  selo: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  seloPonto: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF5A5F' },
  seloTexto: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  logoArea: { alignSelf: 'center', width: 170, height: 170, alignItems: 'center', justifyContent: 'center' },
  logoCaixa: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  logo: { width: 170, height: 170 },
  sigla: { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6, color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 6 },
  numero: { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 8, color: '#fff', fontSize: 64, fontWeight: '900', lineHeight: 70 },
  titulo: { textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6, color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  cartaoTexto: {
    backgroundColor: 'rgba(11,22,51,0.62)',
    borderRadius: raios.lg,
    padding: 16,
  },
  texto: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  secao: { color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: cores.laranja,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(244,122,32,0.12)',
  },
  chipTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  acoes: { gap: 12, marginTop: 6 },
  botaoEntrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 54,
    borderRadius: raios.md,
    backgroundColor: cores.vermelho,
  },
  botaoEntrarTexto: { color: '#fff', fontSize: 17, fontWeight: '800' },
  botaoLigar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  botaoLigarTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
});