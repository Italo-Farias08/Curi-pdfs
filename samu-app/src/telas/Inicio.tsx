import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Eletrocardiograma, Entrada, Ondas, PontoVivo, ToqueMola } from '../componentes/Animados';
import { useSessao } from '../contextos/SessaoContexto';
import type { NomeTela } from '../autorizacao/papeis';
import { gruposDoUsuario } from '../dados/menu';
import { servicosDoUsuario } from '../dados/servicos';
import { categorias, cores, raios } from '../tema/cores';
import type { ParametrosPrincipal } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'Inicio'>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NOMES_DOS_PAPEIS: Record<string, string> = {
  ROLE_SUPERADMIN: 'Super administrador',
  ROLE_ADMIN: 'Administrador',
  ROLE_MEDICO: 'Médico',
  ROLE_ENFERMEIRO: 'Enfermeiro',
  ROLE_TECNICO: 'Técnico',
  ROLE_CONDUTOR: 'Condutor',
  ROLE_ASSISTENTE: 'Assistente',
  ROLE_VISUALIZADOR: 'Visualizador',
};

const MAXIMO_ACESSO_RAPIDO = 6;

function primeiroNome(nomeCompleto?: string): string {
  if (!nomeCompleto) return '';
  return nomeCompleto.trim().split(/\s+/)[0] ?? '';
}

function iniciais(nomeCompleto?: string): string {
  const partes = (nomeCompleto ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function dataPorExtenso(): string {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Chevron({ aberto }: { aberto: boolean }) {
  const valor = useRef(new Animated.Value(aberto ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(valor, {
      toValue: aberto ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [aberto, valor]);

  return (
    <Animated.View
      style={{
        transform: [
          { rotate: valor.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
        ],
      }}
    >
      <MaterialCommunityIcons name="chevron-down" size={24} color={cores.textoSuave} />
    </Animated.View>
  );
}

export default function Inicio({ navigation }: Props) {
  const { usuario } = useSessao();
  const margens = useSafeAreaInsets();
  const papeis = useMemo(() => usuario?.roles ?? [], [usuario?.roles]);

  const grupos = useMemo(() => gruposDoUsuario(papeis), [papeis]);
  const acessoRapido = useMemo(
    () => servicosDoUsuario(papeis).slice(0, MAXIMO_ACESSO_RAPIDO),
    [papeis],
  );
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const abrirTela = (tela: NomeTela) => navigation.navigate(tela as never);
  const alternar = (titulo: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(240, 'easeInEaseOut', 'opacity'));
    setAbertos((anterior) => ({ ...anterior, [titulo]: !anterior[titulo] }));
  };

  const nome = primeiroNome(usuario?.nomeCompleto);
  const unidade = [usuario?.tenantNome, usuario?.tenantCidade].filter(Boolean).join(' · ');
  const perfil = papeis.map((papel) => NOMES_DOS_PAPEIS[papel]).find(Boolean);

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.rolagem}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <LinearGradient
          colors={['#0B1633', '#1a2c5b', '#8E1B2D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: margens.top + 14 }]}
        >
          <View style={styles.decor1} />
          <View style={styles.decor2} />

          <Entrada deslocamento={-12} estilo={styles.heroTopo}>
            <View style={styles.statusPilula}>
              <PontoVivo />
              <Text style={styles.statusTexto}>Sistema operante</Text>
            </View>
            <ToqueMola
              onPress={() => abrirTela('Perfil')}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
              escala={0.9}
            >
              <View style={styles.avatarArea}>
                <Ondas tamanho={44} quantidade={2} cor="rgba(255,255,255,0.4)" />
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>{iniciais(usuario?.nomeCompleto)}</Text>
                </View>
              </View>
            </ToqueMola>
          </Entrada>

          <Entrada atraso={120}>
            <Text style={styles.saudacao}>{saudacao()},</Text>
            <Text style={styles.nome} numberOfLines={1}>
              {nome || 'bem-vindo'}
            </Text>
          </Entrada>

          <Entrada atraso={220} estilo={styles.chips}>
            {perfil ? (
              <View style={styles.chip}>
                <MaterialCommunityIcons name="badge-account-horizontal-outline" size={14} color="#fff" />
                <Text style={styles.chipTexto}>{perfil}</Text>
              </View>
            ) : null}
            {unidade ? (
              <View style={styles.chip}>
                <MaterialCommunityIcons name="hospital-marker" size={14} color="#fff" />
                <Text style={styles.chipTexto} numberOfLines={1}>
                  {unidade}
                </Text>
              </View>
            ) : null}
          </Entrada>

          <Entrada atraso={320} estilo={styles.ecgBloco}>
            <View style={styles.ecgTexto}>
              <Text style={styles.dataTexto}>{dataPorExtenso()}</Text>
              <Text style={styles.emergencia}>Emergência · 192</Text>
            </View>
            <Eletrocardiograma />
          </Entrada>
        </LinearGradient>

        {acessoRapido.length > 0 && (
          <View style={styles.secao}>
            <Entrada atraso={380}>
              <Text style={styles.secaoTitulo}>Acesso rápido</Text>
            </Entrada>
            <View style={styles.grade}>
              {acessoRapido.map((servico, indice) => {
                const tom = categorias[servico.categoria];
                return (
                  <Entrada key={servico.tela} atraso={440 + indice * 70} estilo={styles.celula}>
                    <ToqueMola
                      onPress={() => abrirTela(servico.tela)}
                      accessibilityRole="button"
                      accessibilityLabel={servico.titulo}
                      estilo={styles.cartao}
                    >
                      <View style={[styles.cartaoFaixa, { backgroundColor: tom.icone }]} />
                      <View style={[styles.medalhao, { backgroundColor: tom.fundo }]}>
                        <MaterialCommunityIcons name={servico.icone} size={26} color={tom.icone} />
                      </View>
                      <Text style={styles.cartaoTitulo} numberOfLines={2}>
                        {servico.titulo}
                      </Text>
                      <Text style={styles.cartaoRotulo} numberOfLines={1}>
                        {servico.rotulo}
                      </Text>
                    </ToqueMola>
                  </Entrada>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.secao}>
          <Entrada atraso={500}>
            <Text style={styles.secaoTitulo}>Todos os módulos</Text>
          </Entrada>

          {grupos.length === 0 && (
            <Text style={styles.vazio}>Nenhum serviço disponível para o seu perfil.</Text>
          )}

          {grupos.map((grupo, indice) => {
            const aberto = !!abertos[grupo.titulo];
            const tom = categorias[grupo.categoria];
            return (
              <Entrada key={grupo.titulo} atraso={540 + Math.min(indice, 8) * 60} deslocamento={18}>
                <View style={styles.grupo}>
                  <ToqueMola
                    onPress={() => alternar(grupo.titulo)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: aberto }}
                    escala={0.98}
                  >
                    <View style={styles.grupoTopo}>
                      <View style={[styles.medalhaoPequeno, { backgroundColor: tom.fundo }]}>
                        <MaterialCommunityIcons name={grupo.icone} size={22} color={tom.icone} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>
                        <Text style={styles.grupoSub}>
                          {grupo.itens.length} {grupo.itens.length === 1 ? 'opção' : 'opções'}
                        </Text>
                      </View>
                      <Chevron aberto={aberto} />
                    </View>
                  </ToqueMola>

                  {aberto &&
                    grupo.itens.map((item, posicao) => (
                      <ToqueMola
                        key={`${item.tela}-${posicao}`}
                        onPress={() => abrirTela(item.tela)}
                        accessibilityRole="button"
                        escala={0.98}
                      >
                        <View style={styles.item}>
                          <View style={[styles.marcador, { backgroundColor: tom.icone }]} />
                          <Text style={styles.itemTexto}>{item.rotulo}</Text>
                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={cores.textoSuave}
                          />
                        </View>
                      </ToqueMola>
                    ))}
                </View>
              </Entrada>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { paddingBottom: 32 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decor1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(227,6,19,0.22)',
    top: -80,
    right: -70,
  },
  decor2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -40,
  },
  heroTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPilula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusTexto: { color: '#fff', fontSize: 12, fontWeight: '700' },
  avatarArea: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: cores.vermelho, fontWeight: '800', fontSize: 16 },
  saudacao: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 22 },
  nome: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: '100%',
  },
  chipTexto: { color: '#fff', fontSize: 12, fontWeight: '600', flexShrink: 1 },
  ecgBloco: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },
  ecgTexto: { gap: 2 },
  dataTexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emergencia: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  secao: { paddingHorizontal: 16, marginTop: 22, gap: 12 },
  secaoTitulo: { fontSize: 18, fontWeight: '800', color: cores.texto },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 24, fontSize: 15 },

  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  celula: { width: '48%', flexGrow: 1 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: 14,
    paddingTop: 16,
    minHeight: 132,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.borda,
    shadowColor: '#0F1B3D',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cartaoFaixa: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  medalhao: {
    width: 48,
    height: 48,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cartaoTitulo: { fontSize: 14, fontWeight: '800', color: cores.texto },
  cartaoRotulo: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },

  grupo: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  grupoTopo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  medalhaoPequeno: {
    width: 40,
    height: 40,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grupoTitulo: { fontSize: 15, fontWeight: '800', color: cores.texto },
  grupoSub: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: '#FAFBFD',
  },
  marcador: { width: 6, height: 6, borderRadius: 3 },
  itemTexto: { flex: 1, fontSize: 15, color: cores.texto, fontWeight: '500' },
});