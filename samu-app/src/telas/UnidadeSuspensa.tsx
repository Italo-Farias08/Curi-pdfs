import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from '../componentes/Botao';
import { useSessao } from '../contextos/SessaoContexto';
import { cores } from '../tema/cores';

export default function UnidadeSuspensa() {
  const { sair } = useSessao();

  return (
    <View style={styles.tela}>
      <View style={styles.medalhao}>
        <MaterialCommunityIcons name="lock-outline" size={36} color={cores.vermelho} />
      </View>
      <Text style={styles.titulo}>Acesso da unidade suspenso</Text>
      <Text style={styles.texto}>O acesso desta base do SAMU está temporariamente indisponível.</Text>
      <Text style={styles.texto}>
        Procure o <Text style={styles.negrito}>administrador do sistema</Text> para reativar o
        acesso da sua unidade.
      </Text>
      <View style={styles.acao}>
        <Botao titulo="Voltar ao login" aoPressionar={() => sair()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: cores.superficie,
  },
  medalhao: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDECEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: cores.vermelho,
    textAlign: 'center',
    marginBottom: 12,
  },
  texto: {
    fontSize: 15,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  negrito: { fontWeight: '700', color: cores.texto },
  acao: { alignSelf: 'stretch', marginTop: 24 },
});
