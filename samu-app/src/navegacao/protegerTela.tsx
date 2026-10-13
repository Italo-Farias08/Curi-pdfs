import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import { useSessao } from '../contextos/SessaoContexto';
import { NomeTela, telaAutorizada } from '../autorizacao/papeis';
import { cores } from '../tema/cores';
import { TITULOS_DAS_TELAS } from './titulos';

interface PropsDaTela {
  navigation: { goBack: () => void; navigate: (nome: string) => void };
}

export function protegerTela<P extends PropsDaTela>(
  nome: NomeTela,
  Componente: React.ComponentType<P>,
) {
  return function TelaProtegida(props: P) {
    const { usuario } = useSessao();

    if (!telaAutorizada(nome, usuario?.roles ?? [])) {
      return (
        <View style={styles.tela}>
          <Cabecalho titulo={TITULOS_DAS_TELAS[nome]} aoVoltar={() => props.navigation.goBack()} />
          <View style={styles.centro}>
            <MaterialCommunityIcons name="shield-lock-outline" size={44} color={cores.vermelho} />
            <Text style={styles.titulo}>Acesso não autorizado</Text>
            <Text style={styles.texto}>
              O seu perfil não tem permissão para abrir esta tela.
            </Text>
            <View style={styles.acao}>
              <Botao titulo="Voltar ao início" aoPressionar={() => props.navigation.navigate('Inicio')} />
            </View>
          </View>
        </View>
      );
    }

    return <Componente {...props} />;
  };
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  titulo: { fontSize: 20, fontWeight: '800', color: cores.texto, marginTop: 8 },
  texto: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center' },
  acao: { alignSelf: 'stretch', marginTop: 16 },
});
