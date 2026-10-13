import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import CampoTexto from '../componentes/CampoTexto';
import { solicitarRecuperacaoSenha } from '../servicos/autenticacaoServico';
import { cores, raios } from '../tema/cores';
import type { ParametrosAutenticacao } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosAutenticacao, 'EsqueciSenha'>;

const EXPRESSAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EsqueciSenha({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const aoEnviar = async () => {
    setErro('');
    const limpo = email.trim();

    if (!EXPRESSAO_EMAIL.test(limpo)) {
      setErro('Por favor, insira um email válido.');
      return;
    }

    setCarregando(true);
    try {
      await solicitarRecuperacaoSenha(limpo);
      navigation.navigate('Login', {
        mensagem: `Recuperação de senha enviada para ${limpo}. Verifique sua caixa de entrada ou spam.`,
      });
    } catch {
      setErro('Email não cadastrado.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Cabecalho titulo="Recuperar senha" aoVoltar={() => navigation.goBack()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudo}>
        <View style={styles.cartao}>
          <Text style={styles.explicacao}>
            Informe o e-mail cadastrado. Enviaremos as instruções para você redefinir a senha.
          </Text>

          <CampoTexto
            rotulo="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            placeholder="Digite seu e-mail"
            returnKeyType="send"
            onSubmitEditing={aoEnviar}
          />

          {erro ? (
            <View style={styles.avisoErro}>
              <Text style={styles.avisoErroTexto}>{erro}</Text>
            </View>
          ) : null}

          <Botao titulo="Enviar instruções" aoPressionar={aoEnviar} carregando={carregando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  explicacao: { fontSize: 14, color: cores.textoSecundario, lineHeight: 20, marginBottom: 18 },
  avisoErro: {
    backgroundColor: cores.erroFundo,
    borderRadius: raios.sm,
    padding: 12,
    marginBottom: 14,
  },
  avisoErroTexto: { color: cores.erro, fontSize: 14 },
});
