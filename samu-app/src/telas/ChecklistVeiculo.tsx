import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import ModalDetalheChecklist from '../componentes/ModalDetalheChecklist';
import ModalSessaoChecklist from '../componentes/ModalSessaoChecklist';
import { useSessao } from '../contextos/SessaoContexto';
import { checklistVeiculoServico } from '../servicos/checklistVeiculoServico';
import { cores, raios } from '../tema/cores';
import {
  agruparPorSessao,
  contarProblemas,
  itensComProblema,
  ROTULO_SITUACAO,
  sobreporSituacoesSalvas,
} from '../utilitarios/checklist';
import { formatarDataSegura } from '../utilitarios/dataHora';
import { identificacaoDaViatura, identificacaoVeiculo } from '../utilitarios/veiculo';
import type { ParametrosPrincipal } from '../navegacao/tipos';
import type {
  ChecklistRealizado,
  ItemAvaliado,
  ItensPorSessao,
  Situacao,
  VeiculoDisponivel,
} from '../tipos/checklist';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'ChecklistVeiculo'>;
type Aba = 'espera' | 'realizados';

interface Resultado {
  mensagem: string;
  itens: ItemAvaliado[];
}

function mensagemDeErro(erro: unknown, padrao: string): string {
  const dados = (erro as { response?: { data?: unknown } })?.response?.data;
  if (typeof dados === 'string' && dados) return dados;
  if (dados && typeof dados === 'object') {
    const objeto = dados as { message?: string; error?: string };
    return objeto.message ?? objeto.error ?? padrao;
  }
  return padrao;
}

export default function ChecklistVeiculo({ navigation }: Props) {
  const { usuario } = useSessao();
  const cpf = usuario?.cpf;

  const [veiculos, setVeiculos] = useState<VeiculoDisponivel[]>([]);
  const [pendentes, setPendentes] = useState<ChecklistRealizado[]>([]);
  const [realizados, setRealizados] = useState<ChecklistRealizado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [aba, setAba] = useState<Aba>('espera');

  const [veiculo, setVeiculo] = useState<VeiculoDisponivel | null>(null);
  const [itensPorSessao, setItensPorSessao] = useState<ItensPorSessao>({});
  const [carregandoItens, setCarregandoItens] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sessaoAberta, setSessaoAberta] = useState<string | null>(null);

  const [detalhe, setDetalhe] = useState<ChecklistRealizado | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const carregarListas = useCallback(async () => {
    if (!cpf) return;
    const [rVeiculos, rPendentes, rRealizados] = await Promise.allSettled([
      checklistVeiculoServico.veiculosDisponiveis(),
      checklistVeiculoServico.pendentesPorCpf(cpf),
      checklistVeiculoServico.realizadosPorCpf(cpf),
    ]);
    setVeiculos(rVeiculos.status === 'fulfilled' ? rVeiculos.value : []);
    setPendentes(rPendentes.status === 'fulfilled' ? rPendentes.value : []);
    setRealizados(rRealizados.status === 'fulfilled' ? rRealizados.value : []);
    if (rPendentes.status === 'rejected') {
      Alert.alert('Erro', 'Erro ao carregar checklists pendentes');
    }
  }, [cpf]);

  useEffect(() => {
    setCarregando(true);
    carregarListas().finally(() => setCarregando(false));
  }, [carregarListas]);

  const atualizar = async () => {
    setAtualizando(true);
    await carregarListas();
    setAtualizando(false);
  };

  const limparFormulario = () => {
    setVeiculo(null);
    setItensPorSessao({});
    setIdEmEdicao(null);
    setObservacoes('');
    setSessaoAberta(null);
  };

  const carregarItens = async (placa: string): Promise<ItensPorSessao | null> => {
    setCarregandoItens(true);
    try {
      const itens = await checklistVeiculoServico.itensPorPlaca(placa);
      const agrupado = agruparPorSessao(itens);
      setItensPorSessao(agrupado);
      return agrupado;
    } catch {
      Alert.alert('Erro', 'Erro ao carregar checklist');
      return null;
    } finally {
      setCarregandoItens(false);
    }
  };

  const iniciar = async (escolhido: VeiculoDisponivel) => {
    setVeiculo(escolhido);
    setIdEmEdicao(null);
    setObservacoes('');
    const itens = await carregarItens(escolhido.placa);
    if (!itens) limparFormulario();
  };

  const editar = async (checklist: ChecklistRealizado) => {
    setVeiculo({
      tipoVeiculo: checklist.tipoVeiculo,
      tipo: checklist.tipo,
      modelo: '',
      placa: checklist.placa,
      descricao: checklist.descricaoVeiculo,
    });
    const itensDoPadrao = await carregarItens(checklist.placa);
    if (!itensDoPadrao) {
      limparFormulario();
      return;
    }
    setItensPorSessao(sobreporSituacoesSalvas(itensDoPadrao, checklist));
    setIdEmEdicao(checklist.id);
    setObservacoes(checklist.observacoes || '');
  };

  const escolher = (sessao: string, idItem: number, situacao: Situacao) => {
    setItensPorSessao((anterior) => ({
      ...anterior,
      [sessao]: (anterior[sessao] ?? []).map((item) =>
        item.id === idItem ? { ...item, situacao } : item,
      ),
    }));
  };

  const salvar = async () => {
    if (!usuario?.nomeCompleto || !cpf) {
      Alert.alert('Erro', 'Dados do usuário incompletos. Faça login novamente.');
      return;
    }
    if (!veiculo) {
      Alert.alert('Erro', 'Selecione um tipo de checklist antes de enviar');
      return;
    }

    const problemas = itensComProblema(itensPorSessao);
    const payload = {
      registradoPor: usuario.nomeCompleto,
      cpf,
      status: 'AGUARDANDO',
      tipo: 'CHECKLIST',
      tipoVeiculo: veiculo.tipoVeiculo || veiculo.placa,
      placa: veiculo.placa,
      observacoes,
      itens: problemas.map((item) => ({
        idItem: item.id,
        nomeItem: item.nomeItem,
        sessao: item.sessaoVeiculo,
        situacao: item.situacao,
      })),
      totalItensFaltantes: problemas.length,
    };

    setSalvando(true);
    try {
      if (idEmEdicao) {
        await checklistVeiculoServico.atualizar(idEmEdicao, payload);
      } else {
        await checklistVeiculoServico.criar(payload);
      }
      setResultado({
        mensagem: idEmEdicao ? 'Checklist atualizado com sucesso!' : 'Checklist criado com sucesso!',
        itens: problemas,
      });
      limparFormulario();
      carregarListas();
    } catch (erro) {
      Alert.alert('Erro', mensagemDeErro(erro, 'Erro ao enviar checklist'));
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (id: number) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir este checklist?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await checklistVeiculoServico.excluir(id);
            carregarListas();
          } catch (erro) {
            Alert.alert('Erro', mensagemDeErro(erro, 'Erro ao excluir checklist'));
          }
        },
      },
    ]);
  };

  const sessoes = useMemo(() => Object.keys(itensPorSessao), [itensPorSessao]);
  const emFormulario = veiculo !== null;
  const listaAtual = aba === 'espera' ? pendentes : realizados;

  return (
    <View style={styles.tela}>
      <Cabecalho
        titulo="Checklist do Veículo"
        subtitulo={
          emFormulario
            ? `${veiculo.placa} — ${identificacaoDaViatura(veiculo.descricao, veiculo.tipoVeiculo)}`
            : 'Selecione o veículo e registre a vistoria'
        }
        aoVoltar={() => (emFormulario ? limparFormulario() : navigation.goBack())}
      />

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.vermelho} />
        </View>
      ) : emFormulario ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            {idEmEdicao ? (
              <View style={styles.faixaEdicao}>
                <Text style={styles.faixaEdicaoTexto}>Editando o checklist #{idEmEdicao}</Text>
              </View>
            ) : null}

            <Text style={styles.secao}>Sessões do veículo</Text>
            {carregandoItens ? (
              <ActivityIndicator color={cores.vermelho} style={{ marginVertical: 24 }} />
            ) : sessoes.length === 0 ? (
              <Text style={styles.vazio}>Este veículo não tem itens cadastrados no padrão.</Text>
            ) : (
              sessoes.map((sessao) => {
                const itens = itensPorSessao[sessao];
                const problemas = contarProblemas(itens);
                return (
                  <Pressable
                    key={sessao}
                    onPress={() => setSessaoAberta(sessao)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.sessao, pressed && styles.pressionado]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessaoNome}>{sessao}</Text>
                      <Text style={styles.sessaoSub}>{itens.length} itens</Text>
                    </View>
                    {problemas > 0 && (
                      <View style={styles.seloProblema}>
                        <Text style={styles.seloProblemaTexto}>{problemas}</Text>
                      </View>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={24} color={cores.textoSuave} />
                  </Pressable>
                );
              })
            )}

            <Text style={styles.secao}>Observações</Text>
            <TextInput
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={4}
              placeholder="Descreva qualquer observação sobre o veículo"
              placeholderTextColor={cores.textoSuave}
              style={styles.observacoes}
              textAlignVertical="top"
            />

            <View style={styles.acoes}>
              <Botao
                titulo={idEmEdicao ? 'Atualizar checklist' : 'Salvar checklist'}
                aoPressionar={salvar}
                carregando={salvando}
                desabilitado={carregandoItens || sessoes.length === 0}
              />
              <Botao titulo="Cancelar" aoPressionar={limparFormulario} variante="secundario" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.conteudo}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        >
          <Text style={styles.secao}>Selecione o veículo</Text>
          {veiculos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum veículo disponível para checklist.</Text>
          ) : (
            veiculos.map((item) => (
              <Pressable
                key={item.placa}
                onPress={() => iniciar(item)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.veiculo, pressed && styles.pressionado]}
              >
                <MaterialCommunityIcons name="ambulance" size={30} color={cores.vermelho} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.veiculoNome}>
                    {identificacaoDaViatura(item.descricao, item.tipoVeiculo)}
                  </Text>
                  <Text style={styles.veiculoSub}>{item.tipo}</Text>
                </View>
                <View style={styles.placa}>
                  <Text style={styles.placaTexto}>{item.placa}</Text>
                </View>
              </Pressable>
            ))
          )}

          <View style={styles.abas}>
            <Pressable
              onPress={() => setAba('espera')}
              style={[styles.aba, aba === 'espera' && styles.abaAtiva]}
            >
              <Text style={[styles.abaTexto, aba === 'espera' && styles.abaTextoAtivo]}>
                Em espera ({pendentes.length})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAba('realizados')}
              style={[styles.aba, aba === 'realizados' && styles.abaAtiva]}
            >
              <Text style={[styles.abaTexto, aba === 'realizados' && styles.abaTextoAtivo]}>
                Realizados ({realizados.length})
              </Text>
            </Pressable>
          </View>

          {listaAtual.length === 0 ? (
            <Text style={styles.vazio}>
              {aba === 'espera' ? 'Nenhum checklist em espera.' : 'Nenhum checklist realizado.'}
            </Text>
          ) : (
            listaAtual.map((checklist) => (
              <View key={checklist.id} style={styles.cartao}>
                <Pressable onPress={() => setDetalhe(checklist)} accessibilityRole="button">
                  <View style={styles.cartaoTopo}>
                    <Text style={styles.cartaoTitulo}>
                      {checklist.placa} — {identificacaoVeiculo(checklist)}
                    </Text>
                    <View style={styles.status}>
                      <Text style={styles.statusTexto}>{checklist.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cartaoSub}>
                    {formatarDataSegura(checklist.dataCriacao)} · {checklist.itens.length}{' '}
                    {checklist.itens.length === 1 ? 'item com problema' : 'itens com problema'}
                  </Text>
                </Pressable>
                {aba === 'espera' && (
                  <View style={styles.cartaoAcoes}>
                    <View style={{ flex: 1 }}>
                      <Botao
                        titulo="Editar"
                        aoPressionar={() => editar(checklist)}
                        variante="secundario"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Botao
                        titulo="Excluir"
                        aoPressionar={() => confirmarExclusao(checklist.id)}
                        variante="perigo"
                      />
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <ModalSessaoChecklist
        visivel={sessaoAberta !== null}
        sessao={sessaoAberta}
        itens={sessaoAberta ? (itensPorSessao[sessaoAberta] ?? []) : []}
        aoEscolher={(idItem, situacao) => sessaoAberta && escolher(sessaoAberta, idItem, situacao)}
        aoFechar={() => setSessaoAberta(null)}
      />

      <ModalDetalheChecklist checklist={detalhe} aoFechar={() => setDetalhe(null)} />

      <Modal visible={!!resultado} transparent animationType="fade" onRequestClose={() => setResultado(null)}>
        <View style={styles.fundoModal}>
          <View style={styles.janela}>
            <MaterialCommunityIcons name="check-circle" size={44} color={cores.sucesso} />
            <Text style={styles.janelaTitulo}>{resultado?.mensagem}</Text>
            {resultado && resultado.itens.length > 0 ? (
              <ScrollView style={styles.janelaLista}>
                <Text style={styles.janelaSub}>Itens com problema registrados</Text>
                {resultado.itens.map((item) => (
                  <View key={`${item.sessaoVeiculo}-${item.id}`} style={styles.janelaLinha}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nomeItem}>{item.nomeItem}</Text>
                      <Text style={styles.veiculoSub}>{item.sessaoVeiculo}</Text>
                    </View>
                    <Text style={item.situacao === 'Q' ? styles.quebrado : styles.faltando}>
                      {ROTULO_SITUACAO[item.situacao]}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.janelaSub}>Todos os itens estão perfeitos.</Text>
            )}
            <Botao titulo="Fechar" aoPressionar={() => setResultado(null)} estilo={{ alignSelf: 'stretch' }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: 16, gap: 10, paddingBottom: 40 },
  secao: { fontSize: 16, fontWeight: '800', color: cores.texto, marginTop: 6 },
  vazio: { fontSize: 14, color: cores.textoSecundario, paddingVertical: 8 },
  pressionado: { backgroundColor: '#F7F9FC' },
  faixaEdicao: { backgroundColor: '#FEF5E0', borderRadius: raios.sm, padding: 10 },
  faixaEdicaoTexto: { color: '#92400E', fontWeight: '700', fontSize: 13 },
  veiculo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  veiculoNome: { fontSize: 15, fontWeight: '700', color: cores.texto },
  veiculoSub: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  placa: {
    borderWidth: 2,
    borderColor: cores.marinho,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#fff',
  },
  placaTexto: { fontWeight: '800', letterSpacing: 1, color: cores.marinho, fontSize: 13 },
  abas: {
    flexDirection: 'row',
    backgroundColor: '#E2E7F0',
    borderRadius: raios.md,
    padding: 4,
    marginTop: 14,
  },
  aba: { flex: 1, paddingVertical: 10, borderRadius: raios.sm, alignItems: 'center' },
  abaAtiva: { backgroundColor: cores.superficie },
  abaTexto: { fontSize: 13, fontWeight: '600', color: cores.textoSecundario },
  abaTextoAtivo: { color: cores.texto, fontWeight: '800' },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
    gap: 12,
  },
  cartaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cartaoTitulo: { flex: 1, fontSize: 15, fontWeight: '700', color: cores.texto },
  cartaoSub: { fontSize: 12, color: cores.textoSecundario, marginTop: 4 },
  cartaoAcoes: { flexDirection: 'row', gap: 10 },
  status: {
    backgroundColor: '#E8EEFB',
    borderRadius: raios.circulo,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusTexto: { fontSize: 11, fontWeight: '700', color: cores.azul },
  sessao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  sessaoNome: { fontSize: 15, fontWeight: '700', color: cores.texto },
  sessaoSub: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  seloProblema: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  seloProblemaTexto: { color: '#fff', fontSize: 12, fontWeight: '800' },
  observacoes: {
    minHeight: 96,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    padding: 12,
    fontSize: 15,
    color: cores.texto,
  },
  acoes: { gap: 10, marginTop: 8 },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  janela: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: cores.superficie,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  janelaTitulo: { fontSize: 18, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  janelaSub: { fontSize: 13, color: cores.textoSecundario, marginBottom: 6 },
  janelaLista: { alignSelf: 'stretch' },
  janelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  nomeItem: { fontSize: 14, fontWeight: '600', color: cores.texto },
  quebrado: { color: '#A16207', fontWeight: '800', fontSize: 12 },
  faltando: { color: '#BE123C', fontWeight: '800', fontSize: 12 },
});
