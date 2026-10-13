import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvisoFlutuante, { MensagemAviso } from '../componentes/AvisoFlutuante';
import { Entrada, ToqueMola } from '../componentes/Animados';
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import CampoTexto from '../componentes/CampoTexto';
import Carregando from '../componentes/Carregando';
import Folha from '../componentes/Folha';
import { useSessao } from '../contextos/SessaoContexto';
import { Tenant, UsuarioSistema, usuarioServico } from '../servicos/usuarioServico';
import { cores, raios } from '../tema/cores';
import { formatarCpf, mensagemDeErro } from '../utilitarios/formatadores';
import type { ParametrosPrincipal } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'UsuariosSistema'>;

const PERFIS_DISPONIVEIS = [
  'ROLE_USUARIO',
  'ROLE_ADMIN',
  'ROLE_ASSISTENTE',
  'ROLE_CONDUTOR',
  'ROLE_ENFERMEIRO',
  'ROLE_MEDICO',
  'ROLE_TECNICO',
];

interface Formulario {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  username: string;
  password: string;
  roles: string[];
}

const formularioVazio: Formulario = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  username: '',
  password: '',
  roles: ['ROLE_USUARIO'],
};

const rotuloPerfil = (papel: string) => papel.replace('ROLE_', '');

export default function UsuariosSistemaTela({ navigation }: Props) {
  const { usuario } = useSessao();
  const ehSuperAdmin = usuario?.roles?.includes('ROLE_SUPERADMIN') ?? false;

  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantFiltro, setTenantFiltro] = useState<number | 'todos'>('todos');

  const [folhaAberta, setFolhaAberta] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');

  const avisar = (texto: string, tipo: 'sucesso' | 'erro') =>
    setAviso({ texto, tipo, chave: Date.now() });

  useEffect(() => {
    if (!ehSuperAdmin) return;
    usuarioServico
      .listarTenants()
      .then(setTenants)
      .catch(() => setTenants([]));
  }, [ehSuperAdmin]);

  const buscarUsuarios = useCallback(async () => {
    try {
      const lista =
        ehSuperAdmin && tenantFiltro !== 'todos'
          ? await usuarioServico.listarPorTenant(tenantFiltro)
          : await usuarioServico.listarTodos(ehSuperAdmin);
      setUsuarios([...lista].sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch {
      setUsuarios([]);
      avisar('Não foi possível carregar os usuários.', 'erro');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [ehSuperAdmin, tenantFiltro]);

  useEffect(() => {
    setCarregando(true);
    buscarUsuarios();
  }, [buscarUsuarios]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuarios;
    const numeros = busca.replace(/\D/g, '');
    const buscaPorCpf = numeros.length > 0 && /[\d.-]/.test(busca);
    return usuarios.filter((u) =>
      buscaPorCpf
        ? (u.cpf ?? '').replace(/\D/g, '').includes(numeros)
        : u.nome.toLowerCase().includes(termo),
    );
  }, [usuarios, busca]);

  const alterar = (campo: keyof Formulario, valor: string) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]:
        campo === 'cpf' ? formatarCpf(valor) : campo === 'nome' ? valor.toUpperCase() : valor,
    }));
  };

  const alternarPerfil = (papel: string) =>
    setFormulario((anterior) => ({
      ...anterior,
      roles: anterior.roles.includes(papel)
        ? anterior.roles.filter((r) => r !== papel)
        : [...anterior.roles, papel],
    }));

  const abrirCriar = () => {
    setEditandoId(null);
    setFormulario({ ...formularioVazio });
    setErroFormulario('');
    setFolhaAberta(true);
  };

  const abrirEditar = (u: UsuarioSistema) => {
    setEditandoId(u.id);
    setFormulario({
      nome: u.nome,
      cpf: formatarCpf(u.cpf),
      telefone: u.telefone ?? '',
      email: u.email,
      username: u.username,
      password: '',
      roles: u.roles?.length ? u.roles : ['ROLE_USUARIO'],
    });
    setErroFormulario('');
    setFolhaAberta(true);
  };

  const salvar = async () => {
    setErroFormulario('');
    if (!formulario.nome || !formulario.cpf || !formulario.email || !formulario.username) {
      setErroFormulario('Preencha todos os campos obrigatórios.');
      return;
    }
    if (editandoId == null && !formulario.password) {
      setErroFormulario('Senha é obrigatória para novo usuário.');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId != null) {
        const dados: Record<string, unknown> = {
          nome: formulario.nome,
          telefone: formulario.telefone,
          email: formulario.email,
          username: formulario.username,
          cpf: formulario.cpf,
          roles: formulario.roles,
        };
        if (formulario.password) dados.password = formulario.password;
        await usuarioServico.atualizarDados(editandoId, dados);
        avisar('Usuário atualizado com sucesso!', 'sucesso');
      } else {
        await usuarioServico.criarUsuarioAdmin({
          nome: formulario.nome,
          cpf: formulario.cpf,
          telefone: formulario.telefone || '00000000000',
          email: formulario.email,
          username: formulario.username,
          password: formulario.password,
          termo: 'Criado pelo ADMIN',
          roles: formulario.roles,
        });
        avisar('Usuário criado com sucesso!', 'sucesso');
      }
      setFolhaAberta(false);
      buscarUsuarios();
    } catch (falha) {
      setErroFormulario(mensagemDeErro(falha, 'Erro ao salvar usuário.'));
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (u: UsuarioSistema) => {
    Alert.alert('Excluir usuário', `Excluir ${u.nome}? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await usuarioServico.deletar(u.id as number);
            avisar('Usuário excluído com sucesso!', 'sucesso');
            buscarUsuarios();
          } catch (falha) {
            avisar(mensagemDeErro(falha, 'Erro ao excluir usuário.'), 'erro');
          }
        },
      },
    ]);
  };

  const cartao = ({ item, index }: { item: UsuarioSistema; index: number }) => (
    <Entrada atraso={Math.min(index, 8) * 50} deslocamento={16}>
      <View style={styles.cartao}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{item.nome.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={styles.detalhe}>{formatarCpf(item.cpf)}</Text>
          <Text style={styles.detalhe} numberOfLines={1}>
            {item.email}
          </Text>
          {ehSuperAdmin && (
            <Text style={[styles.tenant, !item.tenantNome && styles.tenantSuper]}>
              {item.tenantNome || 'SUPERADMIN'}
            </Text>
          )}
          <View style={styles.perfis}>
            {item.roles?.map((r) => (
              <View key={r} style={styles.perfil}>
                <Text style={styles.perfilTexto}>{rotuloPerfil(r)}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.acoes}>
          <Pressable
            onPress={() => abrirEditar(item)}
            hitSlop={8}
            accessibilityLabel="Editar"
            style={[styles.botaoAcao, { backgroundColor: '#E8EEFB' }]}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={cores.azul} />
          </Pressable>
          <Pressable
            onPress={() => confirmarExclusao(item)}
            hitSlop={8}
            accessibilityLabel="Excluir"
            style={[styles.botaoAcao, { backgroundColor: cores.erroFundo }]}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={cores.erro} />
          </Pressable>
        </View>
      </View>
    </Entrada>
  );

  return (
    <View style={styles.tela}>
      <Cabecalho
        titulo="Usuários do Sistema"
        subtitulo={usuario?.tenantNome}
        aoVoltar={() => navigation.goBack()}
      />

      <View style={styles.corpo}>
        <AvisoFlutuante mensagem={aviso} />

        <View style={styles.barra}>
          <View style={styles.busca}>
            <MaterialCommunityIcons name="magnify" size={20} color={cores.textoSuave} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou CPF"
              placeholderTextColor={cores.textoSuave}
              style={styles.buscaEntrada}
              autoCorrect={false}
            />
            {busca ? (
              <Pressable onPress={() => setBusca('')} hitSlop={10}>
                <MaterialCommunityIcons name="close-circle" size={18} color={cores.textoSuave} />
              </Pressable>
            ) : null}
          </View>
          <ToqueMola onPress={abrirCriar} accessibilityLabel="Novo usuário" estilo={styles.botaoNovo}>
            <MaterialCommunityIcons name="account-plus" size={22} color="#fff" />
          </ToqueMola>
        </View>

        {ehSuperAdmin && tenants.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtros}
          >
            {[{ id: 'todos' as const, nome: 'Todos' }, ...tenants].map((t) => {
              const ativo = tenantFiltro === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTenantFiltro(t.id)}
                  style={[styles.filtro, ativo && styles.filtroAtivo]}
                >
                  <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>
                    {t.nome}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <Text style={styles.contagem}>
          {filtrados.length} {filtrados.length === 1 ? 'usuário' : 'usuários'}
        </Text>

        {carregando ? (
          <Carregando mensagem="Carregando usuários..." />
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(u) => String(u.id)}
            renderItem={cartao}
            contentContainerStyle={styles.lista}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={() => {
                  setAtualizando(true);
                  buscarUsuarios();
                }}
                tintColor={cores.vermelho}
              />
            }
            ListEmptyComponent={
              <Text style={styles.vazio}>
                {busca ? 'Nenhum usuário encontrado para essa busca.' : 'Nenhum usuário cadastrado.'}
              </Text>
            }
          />
        )}
      </View>

      <Folha
        visivel={folhaAberta}
        titulo={editandoId != null ? 'Editar usuário' : 'Novo usuário'}
        subtitulo={
          editandoId != null
            ? 'Atualize os dados do usuário'
            : 'O usuário será criado com e-mail já confirmado'
        }
        aoFechar={() => setFolhaAberta(false)}
      >
        <CampoTexto
          rotulo="Nome completo *"
          value={formulario.nome}
          onChangeText={(v) => alterar('nome', v)}
          autoCapitalize="characters"
        />
        <CampoTexto
          rotulo="CPF *"
          value={formulario.cpf}
          onChangeText={(v) => alterar('cpf', v)}
          keyboardType="number-pad"
          placeholder="000.000.000-00"
        />
        <CampoTexto
          rotulo="Telefone"
          value={formulario.telefone}
          onChangeText={(v) => alterar('telefone', v)}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
        />
        <CampoTexto
          rotulo="E-mail *"
          value={formulario.email}
          onChangeText={(v) => alterar('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CampoTexto
          rotulo="Login (usuário) *"
          value={formulario.username}
          onChangeText={(v) => alterar('username', v)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CampoTexto
          rotulo={editandoId != null ? 'Nova senha' : 'Senha *'}
          senha
          value={formulario.password}
          onChangeText={(v) => alterar('password', v)}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={editandoId != null ? 'Deixe vazio para manter' : undefined}
        />

        <Text style={styles.rotuloPerfis}>Perfis de acesso</Text>
        <View style={styles.grade}>
          {PERFIS_DISPONIVEIS.map((papel) => {
            const marcado = formulario.roles.includes(papel);
            return (
              <Pressable
                key={papel}
                onPress={() => alternarPerfil(papel)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: marcado }}
                style={[styles.opcao, marcado && styles.opcaoMarcada]}
              >
                <MaterialCommunityIcons
                  name={marcado ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={marcado ? cores.vermelho : cores.textoSuave}
                />
                <Text style={[styles.opcaoTexto, marcado && { color: cores.vermelho }]}>
                  {rotuloPerfil(papel)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {erroFormulario ? (
          <View style={styles.erro}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={cores.erro} />
            <Text style={styles.erroTexto}>{erroFormulario}</Text>
          </View>
        ) : null}

        <Botao
          titulo={editandoId != null ? 'Atualizar' : 'Criar usuário'}
          aoPressionar={salvar}
          carregando={salvando}
        />
      </Folha>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  corpo: { flex: 1 },
  barra: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  busca: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  buscaEntrada: { flex: 1, fontSize: 15, color: cores.texto, paddingVertical: 10 },
  botaoNovo: {
    width: 48,
    height: 48,
    borderRadius: raios.md,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtros: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  filtroAtivo: { backgroundColor: cores.marinho, borderColor: cores.marinho },
  filtroTexto: { fontSize: 13, fontWeight: '600', color: cores.texto },
  filtroTextoAtivo: { color: '#fff' },
  contagem: { paddingHorizontal: 18, fontSize: 12, color: cores.textoSecundario, marginBottom: 4 },
  lista: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 32 },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 40, fontSize: 15 },
  cartao: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDECEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: cores.vermelho, fontWeight: '800', fontSize: 17 },
  nome: { fontSize: 15, fontWeight: '800', color: cores.texto },
  detalhe: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },
  tenant: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    backgroundColor: '#E8EEFB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tenantSuper: { color: '#7E22CE', backgroundColor: '#F3EAFB' },
  perfis: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  perfil: { backgroundColor: '#EEF1F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  perfilTexto: { fontSize: 10, fontWeight: '700', color: cores.textoSecundario },
  acoes: { gap: 8 },
  botaoAcao: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotuloPerfis: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 8 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: raios.sm,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: '#FAFBFD',
  },
  opcaoMarcada: { borderColor: cores.vermelho, backgroundColor: '#FDECEE' },
  opcaoTexto: { fontSize: 13, fontWeight: '600', color: cores.texto },
  erro: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: cores.erroFundo,
    borderRadius: raios.sm,
    padding: 12,
    marginBottom: 14,
  },
  erroTexto: { color: cores.erro, fontSize: 14, flex: 1 },
});