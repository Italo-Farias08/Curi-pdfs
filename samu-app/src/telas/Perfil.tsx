import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import { useSessao } from '../contextos/SessaoContexto';
import { cores } from '../tema/cores';
import type { ParametrosPrincipal } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'Perfil'>;

const NOMES_DOS_PAPEIS: Record<string, string> = {
  ROLE_SUPERADMIN: 'Superadministrador',
  ROLE_ADMIN: 'Administrador',
  ROLE_ENFERMEIRO: 'Enfermeiro',
  ROLE_MEDICO: 'Médico',
  ROLE_TECNICO: 'Técnico',
  ROLE_CONDUTOR: 'Condutor',
  ROLE_ASSISTENTE: 'Assistente',
  ROLE_VISUALIZADOR: 'Visitante',
};

function formatarCpf(cpf?: string): string {
  const digitos = (cpf ?? '').replace(/\D/g, '');
  if (digitos.length !== 11) return cpf ?? '';
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function iniciais(nome?: string): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return (primeira + ultima).toUpperCase();
}

export default function Perfil({ navigation }: Props) {
  const { usuario, sair } = useSessao();

  const papeis = (usuario?.roles ?? []).map((papel) => NOMES_DOS_PAPEIS[papel] ?? papel);
  const unidade = [usuario?.tenantNome, usuario?.tenantCidade, usuario?.tenantEstado]
    .filter(Boolean)
    .join(' - ');

  const confirmarSaida = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => sair() },
    ]);
  };

  return (
    <View style={styles.tela}>
      <Cabecalho titulo="Meu perfil" aoVoltar={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.identidade}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciais(usuario?.nomeCompleto)}</Text>
          </View>
          <Text style={styles.nome}>{usuario?.nomeCompleto}</Text>
          {papeis.length > 0 && <Text style={styles.papeis}>{papeis.join(' · ')}</Text>}
        </View>

        <View style={styles.cartao}>
          <Item rotulo="Usuário" valor={usuario?.username} />
          <Item rotulo="CPF" valor={formatarCpf(usuario?.cpf)} />
          <Item rotulo="E-mail" valor={usuario?.email} />
          <Item rotulo="Telefone" valor={usuario?.telefone} />
          <Item rotulo="Unidade" valor={unidade} ultimo />
        </View>

        <Botao titulo="Sair" aoPressionar={confirmarSaida} variante="perigo" />
      </ScrollView>
    </View>
  );
}

function Item({ rotulo, valor, ultimo = false }: { rotulo: string; valor?: string; ultimo?: boolean }) {
  return (
    <View style={[styles.item, !ultimo && styles.itemBorda]}>
      <Text style={styles.itemRotulo}>{rotulo}</Text>
      <Text style={styles.itemValor}>{valor || 'Não informado'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16 },
  identidade: { alignItems: 'center', paddingVertical: 8 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: cores.marinho,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTexto: { color: '#fff', fontSize: 30, fontWeight: '800' },
  nome: { fontSize: 20, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  papeis: { fontSize: 13, color: cores.textoSecundario, marginTop: 4, textAlign: 'center' },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 16,
  },
  item: { paddingVertical: 14 },
  itemBorda: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  itemRotulo: { fontSize: 12, color: cores.textoSuave, marginBottom: 2 },
  itemValor: { fontSize: 16, color: cores.texto, fontWeight: '500' },
});
