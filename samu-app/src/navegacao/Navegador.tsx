import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import Cabecalho from '../componentes/Cabecalho';
import Carregando from '../componentes/Carregando';
import ModalNotificacoes from '../componentes/ModalNotificacoes';
import TelaEmConstrucao from '../componentes/TelaEmConstrucao';
import { useSessao } from '../contextos/SessaoContexto';
import { useNotificacoesPendentes } from '../hooks/useNotificacoesPendentes';
import { NomeTela, PAPEIS_POR_TELA } from '../autorizacao/papeis';
import { cores } from '../tema/cores';
import EsqueciSenha from '../telas/EsqueciSenha';
import Inicio from '../telas/Inicio';
import Apresentacao from '../telas/Apresentacao';
import Login from '../telas/Login';
import ChecklistVeiculo from '../telas/ChecklistVeiculo';
import Perfil from '../telas/Perfil';
import UsuariosSistema from '../telas/UsuariosSistema';
import EquipeDoDia from '../telas/EquipeDoDia';
import EscalaMensal from '../telas/EscalaMensal';
import PainelFrota from '../telas/PainelFrota';
import UnidadeSuspensa from '../telas/UnidadeSuspensa';
import { protegerTela } from './protegerTela';
import { TITULOS_DAS_TELAS } from './titulos';
import type { ParametrosAutenticacao, ParametrosPrincipal } from './tipos';

const PilhaAutenticacao = createNativeStackNavigator<ParametrosAutenticacao>();
const PilhaPrincipal = createNativeStackNavigator<ParametrosPrincipal>();

type PropsTelaPrincipal = NativeStackScreenProps<ParametrosPrincipal, NomeTela>;

function criarTelaEmConstrucao(nome: NomeTela) {
  const Tela = ({ navigation }: PropsTelaPrincipal) => (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <Cabecalho titulo={TITULOS_DAS_TELAS[nome]} aoVoltar={() => navigation.goBack()} />
      <TelaEmConstrucao titulo={TITULOS_DAS_TELAS[nome]} />
    </View>
  );
  return protegerTela(nome, Tela);
}

const TELAS_ESPECIAIS: NomeTela[] = ['Inicio', 'Perfil'];

const TELAS_PRONTAS: Partial<Record<NomeTela, React.ComponentType<any>>> = {
  ChecklistVeiculo: protegerTela('ChecklistVeiculo', ChecklistVeiculo),
  UsuariosSistema: protegerTela('UsuariosSistema', UsuariosSistema),
  EquipeDoDia: protegerTela('EquipeDoDia', EquipeDoDia),
  EscalaMensal: protegerTela('EscalaMensal', EscalaMensal),
  PainelFrota: protegerTela('PainelFrota', PainelFrota),
};

const TELAS_DOS_MODULOS = (Object.keys(PAPEIS_POR_TELA) as NomeTela[])
  .filter((nome) => !TELAS_ESPECIAIS.includes(nome))
  .map((nome) => ({ nome, componente: TELAS_PRONTAS[nome] ?? criarTelaEmConstrucao(nome) }));

const opcoesPadrao = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  contentStyle: { backgroundColor: cores.fundo },
};

export default function Navegador() {
  const { situacao, unidadeSuspensa } = useSessao();
  const notificacoes = useNotificacoesPendentes();

  if (situacao === 'carregando') {
    return <Carregando mensagem="Abrindo o SAMU..." />;
  }

  if (situacao === 'anonimo') {
    return (
      <NavigationContainer key="anonimo">
        <PilhaAutenticacao.Navigator initialRouteName="Apresentacao" screenOptions={opcoesPadrao}>
          <PilhaAutenticacao.Screen name="Apresentacao" component={Apresentacao} />
          <PilhaAutenticacao.Screen name="Login" component={Login} />
          <PilhaAutenticacao.Screen name="EsqueciSenha" component={EsqueciSenha} />
        </PilhaAutenticacao.Navigator>
      </NavigationContainer>
    );
  }

  if (unidadeSuspensa) {
    return <UnidadeSuspensa />;
  }

  return (
    <NavigationContainer key="autenticado">
      <PilhaPrincipal.Navigator initialRouteName="Inicio" screenOptions={opcoesPadrao}>
        <PilhaPrincipal.Screen name="Inicio" component={Inicio} />
        <PilhaPrincipal.Screen name="Perfil" component={Perfil} />
        {TELAS_DOS_MODULOS.map(({ nome, componente }) => (
          <PilhaPrincipal.Screen key={nome} name={nome} component={componente} />
        ))}
      </PilhaPrincipal.Navigator>
      <ModalNotificacoes
        visivel={notificacoes.visivel}
        pendentes={notificacoes.pendentes}
        totalInicial={notificacoes.totalInicial}
        processando={notificacoes.processando}
        aoConfirmar={notificacoes.confirmarLeitura}
      />
    </NavigationContainer>
  );
}