import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AxiosError } from 'axios';
import Botao from '../componentes/Botao';
import CampoTexto from '../componentes/CampoTexto';
import { Eletrocardiograma, Entrada, Ondas } from '../componentes/Animados';
import { useSessao } from '../contextos/SessaoContexto';
import { reenviarConfirmacao } from '../servicos/autenticacaoServico';
import { cores, raios } from '../tema/cores';
import type { ParametrosAutenticacao } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosAutenticacao, 'Login'>;

export default function Login({ navigation, route }: Props) {
  const { entrar } = useSessao();
  const margens = useSafeAreaInsets();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [emailNaoConfirmado, setEmailNaoConfirmado] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [mensagemReenvio, setMensagemReenvio] = useState('');

  const mensagemRecebida = route.params?.mensagem;

  const tremer = useRef(new Animated.Value(0)).current;
  const ambulancia = useRef(new Animated.Value(0)).current;
  const flutuar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rodar = Animated.loop(
      Animated.timing(ambulancia, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const respirar = Animated.loop(
      Animated.sequence([
        Animated.timing(flutuar, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flutuar, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    rodar.start();
    respirar.start();
    return () => {
      rodar.stop();
      respirar.stop();
    };
  }, [ambulancia, flutuar]);

  const sacudirFormulario = () => {
    tremer.setValue(0);
    Animated.sequence([
      Animated.timing(tremer, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(tremer, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(tremer, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(tremer, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const aoEntrar = async () => {
    setErro('');
    setMensagemReenvio('');
    setEmailNaoConfirmado(false);

    if (!usuario.trim() || !senha) {
      setErro('Por favor, preencha todos os campos.');
      sacudirFormulario();
      return;
    }

    setCarregando(true);
    try {
      await entrar(usuario.trim(), senha);
    } catch (falha) {
      const erroAxios = falha as AxiosError;
      const dados = erroAxios.response?.data;
      const texto =
        erroAxios.response == null
          ? 'Erro ao conectar ao servidor.'
          : typeof dados === 'string'
            ? dados
            : 'Erro ao fazer login.';
      setErro(texto);
      sacudirFormulario();
      if (erroAxios.response?.status === 403 && texto.toLowerCase().includes('mail')) {
        setEmailNaoConfirmado(true);
      }
    } finally {
      setCarregando(false);
    }
  };

  const aoReenviar = async () => {
    setReenviando(true);
    setMensagemReenvio('');
    try {
      const mensagem = await reenviarConfirmacao(usuario.trim());
      setMensagemReenvio(mensagem);
    } catch {
      setMensagemReenvio('Não foi possível reenviar agora. Tente novamente em instantes.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.rolagem}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#0B1633', '#1a2c5b', '#8E1B2D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.topo, { paddingTop: margens.top + 28 }]}
        >
          <View style={styles.circuloDecor1} />
          <View style={styles.circuloDecor2} />

          <Entrada deslocamento={-16} estilo={styles.selo}>
            <View style={styles.seloPonto} />
            <Text style={styles.seloTexto}>PLANTÃO 24H · LIGUE 192</Text>
          </Entrada>

          <Entrada atraso={120} deslocamento={30}>
            <Animated.View
              style={[
                styles.logoArea,
                {
                  transform: [
                    {
                      translateY: flutuar.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
                    },
                  ],
                },
              ]}
            >
              <Ondas tamanho={112} />
              <View style={styles.logoCaixa}>
                <Image
                  source={require('../../assets/logo-samu.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
          </Entrada>

          <Entrada atraso={260}>
            <Text style={styles.boasVindas}>SAMU Vitória</Text>
            <Text style={styles.descricao}>Serviço de Atendimento Móvel de Urgência</Text>
          </Entrada>

          <Entrada atraso={380} estilo={styles.ecgLinha}>
            <Eletrocardiograma />
          </Entrada>

          <View style={styles.estrada}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: ambulancia.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-60, Dimensions.get('window').width + 20],
                    }),
                  },
                ],
              }}
            >
              <MaterialCommunityIcons name="ambulance" size={34} color="#fff" />
            </Animated.View>
            <View style={styles.faixa} />
          </View>
        </LinearGradient>

        <Entrada atraso={450} deslocamento={40} estilo={styles.formulario}>
          <Animated.View
            style={{
              transform: [
                { translateX: tremer.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] }) },
              ],
            }}
          >
            <Text style={styles.titulo}>Bem-vindo de volta</Text>
            <Text style={styles.subtitulo}>Acesse com suas credenciais para continuar.</Text>

            {mensagemRecebida ? (
              <View style={styles.avisoSucesso}>
                <MaterialCommunityIcons name="check-circle" size={18} color={cores.sucesso} />
                <Text style={styles.avisoSucessoTexto}>{mensagemRecebida}</Text>
              </View>
            ) : null}

            <CampoTexto
              rotulo="Usuário"
              icone="account-outline"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              autoComplete="username"
              placeholder="Digite seu usuário"
              returnKeyType="next"
            />
            <CampoTexto
              rotulo="Senha"
              icone="lock-outline"
              senha
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              placeholder="Digite sua senha"
              returnKeyType="go"
              onSubmitEditing={aoEntrar}
            />

            {erro ? (
              <View style={styles.avisoErro}>
                <MaterialCommunityIcons name="alert-circle" size={18} color={cores.erro} />
                <Text style={styles.avisoErroTexto}>{erro}</Text>
              </View>
            ) : null}

            {emailNaoConfirmado && (
              <View style={styles.reenvio}>
                <Botao
                  titulo="Reenviar e-mail de confirmação"
                  aoPressionar={aoReenviar}
                  carregando={reenviando}
                  variante="secundario"
                />
                {mensagemReenvio ? <Text style={styles.reenvioTexto}>{mensagemReenvio}</Text> : null}
              </View>
            )}

            <Botao titulo="Entrar" aoPressionar={aoEntrar} carregando={carregando} />

            <Pressable
              onPress={() => navigation.navigate('EsqueciSenha')}
              hitSlop={10}
              accessibilityRole="link"
              style={styles.linkEsqueci}
            >
              <Text style={styles.linkTexto}>Esqueci minha senha</Text>
            </Pressable>
          </Animated.View>
        </Entrada>

        <Entrada atraso={650} estilo={styles.rodape}>
          <MaterialCommunityIcons name="shield-lock-outline" size={14} color={cores.textoSuave} />
          <Text style={styles.rodapeTexto}>Acesso restrito a profissionais autorizados</Text>
        </Entrada>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flexGrow: 1 },
  topo: {
    alignItems: 'center',
    paddingBottom: 0,
    paddingHorizontal: 24,
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  circuloDecor1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(227,6,19,0.22)',
    top: -90,
    right: -80,
  },
  circuloDecor2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    left: -60,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 22,
  },
  seloPonto: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF5A5F' },
  seloTexto: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  logoArea: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  logoCaixa: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  logo: { width: 92, height: 92 },
  boasVindas: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.3,
  },
  descricao: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  ecgLinha: { marginTop: 14 },
  estrada: {
    alignSelf: 'stretch',
    marginHorizontal: -24,
    height: 46,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  faixa: { height: 3, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14 },
  formulario: {
    marginTop: -2,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: cores.superficie,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: cores.borda,
    shadowColor: '#0F1B3D',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.texto },
  subtitulo: { fontSize: 14, color: cores.textoSecundario, marginTop: 4, marginBottom: 20 },
  avisoErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.erroFundo,
    borderRadius: raios.sm,
    padding: 12,
    marginBottom: 14,
  },
  avisoErroTexto: { color: cores.erro, fontSize: 14, flex: 1 },
  avisoSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.sucessoFundo,
    borderRadius: raios.sm,
    padding: 12,
    marginBottom: 14,
  },
  avisoSucessoTexto: { color: cores.sucesso, fontSize: 14, flex: 1 },
  reenvio: { marginBottom: 14, gap: 8 },
  reenvioTexto: { color: cores.textoSecundario, fontSize: 13 },
  linkEsqueci: { alignSelf: 'center', marginTop: 18, padding: 4 },
  linkTexto: { color: cores.azul, fontSize: 15, fontWeight: '600' },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 24,
  },
  rodapeTexto: { color: cores.textoSuave, fontSize: 12 },
});