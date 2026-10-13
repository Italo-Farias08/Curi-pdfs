import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import Carregando from '../componentes/Carregando';
import Folha from '../componentes/Folha';
import { useSessao } from '../contextos/SessaoContexto';
import {
  EquipeDoDia,
  EscalaDoDia,
  ROLES_ELEGIVEIS,
  TIPOS_ESCALA,
  VeiculoDaFrota,
  equipeDoDiaServico,
  funcoesElegiveis,
} from '../servicos/equipeDoDiaServico';
import { usuarioServico } from '../servicos/usuarioServico';
import { cores, raios } from '../tema/cores';
import { formatarDataIso, mensagemDeErro } from '../utilitarios/formatadores';
import type { ParametrosPrincipal } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'EquipeDoDia'>;

interface Membro {
  nome: string;
  funcao: string;
  tipoPlantao: string;
  usuarioId: number | null;
  avulso: boolean;
}

interface Pessoa {
  id: number;
  nome: string;
  roles: string[];
}

type Origem = 'ESCALA' | 'AVULSO';

const FUNCOES = Object.values(ROLES_ELEGIVEIS);
const ROLES_PLANTONISTAS = Object.keys(ROLES_ELEGIVEIS);
const PLANTOES = TIPOS_ESCALA.map((t) => t.label);

function mesmoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dataLegivel(data: Date): string {
  const texto = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function agoraBrasilia(): string {
  const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

function Seletor({
  opcoes,
  valor,
  aoEscolher,
}: {
  opcoes: string[];
  valor: string;
  aoEscolher: (v: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {opcoes.map((o) => {
        const ativo = o === valor;
        return (
          <Pressable
            key={o}
            onPress={() => aoEscolher(o)}
            style={[styles.chip, ativo && styles.chipAtivo]}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function EquipeDoDiaTela({ navigation }: Props) {
  const { usuario } = useSessao();
  const somenteLeitura = usuario?.roles?.includes('ROLE_VISUALIZADOR') ?? false;

  const [dataAtual, setDataAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  });
  const [veiculos, setVeiculos] = useState<VeiculoDaFrota[]>([]);
  const [equipes, setEquipes] = useState<EquipeDoDia[]>([]);
  const [escala, setEscala] = useState<EscalaDoDia[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);

  const [folhaAberta, setFolhaAberta] = useState(false);
  const [veiculoAlvo, setVeiculoAlvo] = useState<VeiculoDaFrota | null>(null);
  const [editando, setEditando] = useState<EquipeDoDia | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [origem, setOrigem] = useState<Origem>('ESCALA');
  const [buscaPessoa, setBuscaPessoa] = useState('');
  const [pessoaAvulsa, setPessoaAvulsa] = useState<Pessoa | null>(null);
  const [nomeLivre, setNomeLivre] = useState('');
  const [funcaoAvulsa, setFuncaoAvulsa] = useState('');
  const [plantaoAvulso, setPlantaoAvulso] = useState(PLANTOES[0]);
  const [salvando, setSalvando] = useState(false);

  const avisar = (texto: string, tipo: 'sucesso' | 'erro') =>
    setAviso({ texto, tipo, chave: Date.now() });

  const dataIso = formatarDataIso(dataAtual);

  const carregarDia = useCallback(async () => {
    try {
      const [listaEquipes, listaEscala] = await Promise.all([
        equipeDoDiaServico.listarPorData(dataIso),
        equipeDoDiaServico.escalaDoDia(dataIso).catch(() => [] as EscalaDoDia[]),
      ]);
      setEquipes(listaEquipes);
      setEscala(listaEscala);
    } catch {
      avisar('Erro ao carregar equipes do dia.', 'erro');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [dataIso]);

  useEffect(() => {
    equipeDoDiaServico
      .veiculos()
      .then((lista) => setVeiculos([...lista].sort((a, b) => (a.placa || '').localeCompare(b.placa || ''))))
      .catch(() => setVeiculos([]));

    // Todos os plantonistas da unidade (base da montagem avulsa).
    Promise.allSettled(ROLES_PLANTONISTAS.map((r) => usuarioServico.listarPorRole(r))).then(
      (resultados) => {
        const porId = new Map<number, Pessoa>();
        resultados.forEach((res, i) => {
          if (res.status !== 'fulfilled') return;
          res.value.forEach((u) => {
            if (u.id == null) return;
            const visto = porId.get(u.id);
            porId.set(u.id, {
              id: u.id,
              nome: u.nome,
              roles: [...(visto?.roles ?? []), ROLES_PLANTONISTAS[i]],
            });
          });
        });
        setPessoas(Array.from(porId.values()).sort((a, b) => a.nome.localeCompare(b.nome)));
      },
    );
  }, []);

  useEffect(() => {
    setCarregando(true);
    carregarDia();
  }, [carregarDia]);

  const mudarDia = (dias: number) =>
    setDataAtual((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + dias));

  const reiniciarFormulario = () => {
    setMembros([]);
    setEditando(null);
    setOrigem('ESCALA');
    setBuscaPessoa('');
    setPessoaAvulsa(null);
    setNomeLivre('');
    setFuncaoAvulsa('');
    setPlantaoAvulso(PLANTOES[0]);
  };

  const abrirAdicionar = (veiculo: VeiculoDaFrota) => {
    reiniciarFormulario();
    setVeiculoAlvo(veiculo);
    setFolhaAberta(true);
  };

  const abrirEditar = (equipe: EquipeDoDia) => {
    reiniciarFormulario();
    const veiculo = veiculos.find((v) => v.placa === equipe.tipoVeiculo) ?? {
      id: 0,
      tipo: '',
      tipoVeiculo: equipe.tipoVeiculo,
      modelo: '',
      placa: equipe.tipoVeiculo,
    };
    const tipoEscala = escala.find((e) => e.usuarioId === equipe.usuarioId)?.tipoEscala;
    const plantao = TIPOS_ESCALA.find((t) => t.value === tipoEscala)?.label || equipe.tipoPlantao;
    setVeiculoAlvo(veiculo);
    setEditando(equipe);
    setMembros([
      {
        nome: equipe.nome,
        funcao: equipe.funcao || '',
        tipoPlantao: plantao,
        usuarioId: equipe.usuarioId ?? null,
        avulso: !!equipe.avulso,
      },
    ]);
    setFolhaAberta(true);
  };

  const jaNaEquipe = useCallback(
    (usuarioId: number | null) =>
      !!veiculoAlvo &&
      equipes.some((e) => e.tipoVeiculo === veiculoAlvo.placa && e.usuarioId === usuarioId),
    [equipes, veiculoAlvo],
  );

  const candidatosEscala = useMemo(
    () =>
      escala.filter(
        (e) => !membros.some((m) => m.usuarioId === e.usuarioId) && !jaNaEquipe(e.usuarioId),
      ),
    [escala, membros, jaNaEquipe],
  );

  const candidatosAvulsos = useMemo(() => {
    const termo = buscaPessoa.trim().toLowerCase();
    return pessoas
      .filter((p) => !membros.some((m) => m.usuarioId === p.id) && !jaNaEquipe(p.id))
      .filter((p) => !termo || p.nome.toLowerCase().includes(termo))
      .slice(0, 8);
  }, [pessoas, membros, buscaPessoa, jaNaEquipe]);

  const adicionarDaEscala = (e: EscalaDoDia) => {
    setMembros((anterior) => [
      ...anterior,
      {
        nome: e.nome,
        funcao: funcoesElegiveis(e.roles)[0] || 'Sem função definida',
        tipoPlantao: TIPOS_ESCALA.find((t) => t.value === e.tipoEscala)?.label || '',
        usuarioId: e.usuarioId,
        avulso: false,
      },
    ]);
  };

  const adicionarAvulso = () => {
    const digitado = nomeLivre.trim();
    if (!pessoaAvulsa && !digitado) {
      avisar('Selecione um profissional ou digite o nome.', 'erro');
      return;
    }
    const funcao = funcaoAvulsa || funcoesElegiveis(pessoaAvulsa?.roles)[0];
    if (!funcao) {
      avisar('Informe a função do profissional.', 'erro');
      return;
    }
    setMembros((anterior) => [
      ...anterior,
      {
        nome: pessoaAvulsa ? pessoaAvulsa.nome : digitado,
        funcao,
        tipoPlantao: plantaoAvulso,
        usuarioId: pessoaAvulsa ? pessoaAvulsa.id : null,
        avulso: true,
      },
    ]);
    setPessoaAvulsa(null);
    setNomeLivre('');
    setBuscaPessoa('');
    setFuncaoAvulsa('');
  };

  const atualizarMembro = (indice: number, campos: Partial<Membro>) =>
    setMembros((anterior) => anterior.map((m, i) => (i === indice ? { ...m, ...campos } : m)));

  const salvar = async () => {
    if (!veiculoAlvo) return;
    if (membros.length === 0) {
      avisar('Adicione pelo menos um membro à equipe.', 'erro');
      return;
    }
    if (membros.some((m) => !m.funcao || !m.tipoPlantao)) {
      avisar('Informe função e tipo de plantão de todos os membros.', 'erro');
      return;
    }

    const registro = (m: Membro) => ({
      nome: m.nome.trim(),
      usuarioId: m.usuarioId,
      tipoVeiculo: veiculoAlvo.placa,
      tipoPlantao: m.tipoPlantao,
      funcao: m.funcao,
      avulso: m.avulso,
      registradoPor: usuario?.nomeCompleto ?? '',
      dataRegOuEdit: agoraBrasilia(),
    });

    setSalvando(true);
    try {
      if (editando) {
        await equipeDoDiaServico.atualizar(editando.id, registro(membros[0]));
        avisar('Equipe atualizada com sucesso!', 'sucesso');
      } else {
        await Promise.all(membros.map((m) => equipeDoDiaServico.criar(registro(m))));
        avisar('Equipe cadastrada com sucesso!', 'sucesso');
      }
      setFolhaAberta(false);
      reiniciarFormulario();
      carregarDia();
    } catch (falha) {
      avisar(mensagemDeErro(falha, 'Erro ao salvar equipe.'), 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = (equipe: EquipeDoDia) => {
    Alert.alert('Excluir registro', `Remover ${equipe.nome} desta equipe?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await equipeDoDiaServico.deletar(equipe.id);
            avisar('Registro excluído com sucesso!', 'sucesso');
            carregarDia();
          } catch (falha) {
            avisar(mensagemDeErro(falha, 'Erro ao excluir registro.'), 'erro');
          }
        },
      },
    ]);
  };

  const ehHoje = mesmoDia(dataAtual, new Date());

  return (
    <View style={styles.tela}>
      <Cabecalho
        titulo="Equipes do Dia"
        subtitulo={usuario?.tenantNome}
        aoVoltar={() => navigation.goBack()}
      />

      <View style={styles.corpo}>
        <AvisoFlutuante mensagem={aviso} />

        <View style={styles.seletorData}>
          <Pressable onPress={() => mudarDia(-1)} hitSlop={10} style={styles.setaData} accessibilityLabel="Dia anterior">
            <MaterialCommunityIcons name="chevron-left" size={26} color={cores.texto} />
          </Pressable>
          <Pressable
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => {
              const h = new Date();
              setDataAtual(new Date(h.getFullYear(), h.getMonth(), h.getDate()));
            }}
          >
            <Text style={styles.dataTexto}>{dataLegivel(dataAtual)}</Text>
            <Text style={styles.dataSub}>{ehHoje ? 'Hoje' : 'Toque para voltar a hoje'}</Text>
          </Pressable>
          <Pressable onPress={() => mudarDia(1)} hitSlop={10} style={styles.setaData} accessibilityLabel="Próximo dia">
            <MaterialCommunityIcons name="chevron-right" size={26} color={cores.texto} />
          </Pressable>
        </View>

        {carregando ? (
          <Carregando mensagem="Carregando equipes..." />
        ) : (
          <ScrollView
            contentContainerStyle={styles.lista}
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={() => {
                  setAtualizando(true);
                  carregarDia();
                }}
                tintColor={cores.vermelho}
              />
            }
          >
            {veiculos.length === 0 && (
              <Text style={styles.vazio}>Nenhum veículo cadastrado.</Text>
            )}
            {veiculos.map((veiculo, indice) => {
              const doVeiculo = equipes.filter((e) => e.tipoVeiculo === veiculo.placa);
              return (
                <Entrada key={veiculo.id} atraso={Math.min(indice, 8) * 60} deslocamento={16}>
                  <View style={styles.cartao}>
                    <View style={styles.cartaoTopo}>
                      <View style={styles.iconeVeiculo}>
                        <MaterialCommunityIcons name="ambulance" size={26} color={cores.vermelho} />
                      </View>
                      <View style={{ flex: 1 }}>
                        {veiculo.descricao ? (
                          <Text style={styles.descricao}>{veiculo.descricao}</Text>
                        ) : null}
                        <Text style={styles.veiculoNome} numberOfLines={1}>
                          {veiculo.tipoVeiculo || veiculo.modelo}
                        </Text>
                        <Text style={styles.veiculoSub} numberOfLines={1}>
                          {[veiculo.tipo, veiculo.modelo].filter(Boolean).join(' - ')}
                        </Text>
                      </View>
                      <View style={styles.placa}>
                        <Text style={styles.placaTexto}>{veiculo.placa}</Text>
                      </View>
                    </View>

                    <View style={styles.cartaoCorpo}>
                      {!somenteLeitura && (
                        <ToqueMola
                          onPress={() => abrirAdicionar(veiculo)}
                          estilo={styles.botaoAdicionar}
                          escala={0.98}
                        >
                          <MaterialCommunityIcons name="plus" size={16} color={cores.textoSecundario} />
                          <Text style={styles.botaoAdicionarTexto}>Adicionar profissional</Text>
                        </ToqueMola>
                      )}

                      {doVeiculo.length === 0 ? (
                        <Text style={styles.semMembros}>Nenhum membro cadastrado</Text>
                      ) : (
                        doVeiculo.map((equipe) => (
                          <View key={equipe.id} style={styles.membro}>
                            <View style={styles.membroAvatar}>
                              <Text style={styles.membroInicial}>{equipe.nome.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={styles.membroNomeLinha}>
                                <Text style={styles.membroNome} numberOfLines={1}>
                                  {equipe.nome}
                                </Text>
                                {equipe.avulso && (
                                  <Text style={styles.avulso}>AVULSO</Text>
                                )}
                              </View>
                              <Text style={styles.membroSub}>
                                {equipe.funcao} • {equipe.tipoPlantao}
                              </Text>
                            </View>
                            {!somenteLeitura && (
                              <View style={styles.membroAcoes}>
                                <Pressable
                                  onPress={() => abrirEditar(equipe)}
                                  hitSlop={8}
                                  accessibilityLabel="Editar"
                                  style={[styles.botaoAcao, { backgroundColor: '#E8EEFB' }]}
                                >
                                  <MaterialCommunityIcons name="pencil" size={16} color={cores.azul} />
                                </Pressable>
                                <Pressable
                                  onPress={() => excluir(equipe)}
                                  hitSlop={8}
                                  accessibilityLabel="Excluir"
                                  style={[styles.botaoAcao, { backgroundColor: cores.erroFundo }]}
                                >
                                  <MaterialCommunityIcons name="trash-can-outline" size={16} color={cores.erro} />
                                </Pressable>
                                {ehHoje && (
                                  <Pressable
                                    onPress={() => navigation.navigate('TrocaPlantao')}
                                    hitSlop={8}
                                    accessibilityLabel="Solicitar troca de plantão"
                                    style={[styles.botaoAcao, { backgroundColor: '#FEF5E0' }]}
                                  >
                                    <MaterialCommunityIcons name="swap-horizontal" size={16} color="#D97706" />
                                  </Pressable>
                                )}
                              </View>
                            )}
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                </Entrada>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Folha
        visivel={folhaAberta}
        titulo={editando ? 'Editar membro' : 'Montar equipe'}
        subtitulo={
          veiculoAlvo
            ? `${veiculoAlvo.descricao ? veiculoAlvo.descricao + ' · ' : ''}${veiculoAlvo.placa} · ${dataLegivel(dataAtual)}`
            : undefined
        }
        aoFechar={() => setFolhaAberta(false)}
      >
        {!editando && (
          <>
            <View style={styles.abas}>
              {(['ESCALA', 'AVULSO'] as Origem[]).map((o) => (
                <Pressable
                  key={o}
                  onPress={() => setOrigem(o)}
                  style={[styles.aba, origem === o && styles.abaAtiva]}
                >
                  <Text style={[styles.abaTexto, origem === o && styles.abaTextoAtivo]}>
                    {o === 'ESCALA' ? 'Da escala' : 'Avulso'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {origem === 'ESCALA' ? (
              candidatosEscala.length === 0 ? (
                <Text style={styles.dica}>
                  Ninguém disponível na Escala Mensal deste dia. Use a aba “Avulso” para cobertura.
                </Text>
              ) : (
                candidatosEscala.map((e) => (
                  <Pressable
                    key={e.usuarioId}
                    onPress={() => adicionarDaEscala(e)}
                    style={styles.candidato}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.membroNome}>{e.nome}</Text>
                      <Text style={styles.membroSub}>
                        {funcoesElegiveis(e.roles)[0] || 'Sem função'} •{' '}
                        {TIPOS_ESCALA.find((t) => t.value === e.tipoEscala)?.label}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="plus-circle" size={24} color={cores.vermelho} />
                  </Pressable>
                ))
              )
            ) : (
              <View>
                <View style={styles.buscaPessoa}>
                  <MaterialCommunityIcons name="magnify" size={20} color={cores.textoSuave} />
                  <TextInput
                    value={buscaPessoa}
                    onChangeText={(v) => {
                      setBuscaPessoa(v);
                      setPessoaAvulsa(null);
                    }}
                    placeholder="Buscar profissional da unidade"
                    placeholderTextColor={cores.textoSuave}
                    style={styles.buscaEntrada}
                  />
                </View>
                {!pessoaAvulsa &&
                  candidatosAvulsos.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        setPessoaAvulsa(p);
                        setBuscaPessoa(p.nome);
                        setFuncaoAvulsa(funcoesElegiveis(p.roles)[0] || '');
                      }}
                      style={styles.candidato}
                    >
                      <Text style={[styles.membroNome, { flex: 1 }]}>{p.nome}</Text>
                      <Text style={styles.membroSub}>{funcoesElegiveis(p.roles)[0]}</Text>
                    </Pressable>
                  ))}

                {!pessoaAvulsa && (
                  <View style={styles.buscaPessoa}>
                    <MaterialCommunityIcons name="account-edit-outline" size={20} color={cores.textoSuave} />
                    <TextInput
                      value={nomeLivre}
                      onChangeText={setNomeLivre}
                      placeholder="…ou digite o nome (sem cadastro)"
                      placeholderTextColor={cores.textoSuave}
                      style={styles.buscaEntrada}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <Text style={styles.rotulo}>Função</Text>
                <Seletor opcoes={FUNCOES} valor={funcaoAvulsa} aoEscolher={setFuncaoAvulsa} />
                <Text style={styles.rotulo}>Plantão</Text>
                <Seletor opcoes={PLANTOES} valor={plantaoAvulso} aoEscolher={setPlantaoAvulso} />
                <View style={{ marginTop: 12 }}>
                  <Botao titulo="Adicionar à equipe" aoPressionar={adicionarAvulso} variante="secundario" />
                </View>
              </View>
            )}
          </>
        )}

        {membros.length > 0 && (
          <View style={{ marginTop: editando ? 0 : 20 }}>
            <Text style={styles.rotuloSecao}>{editando ? 'Profissional' : 'Equipe montada'}</Text>
            {membros.map((m, i) => (
              <View key={`${m.usuarioId}-${i}`} style={styles.membroForm}>
                <View style={styles.membroNomeLinha}>
                  <Text style={[styles.membroNome, { flex: 1 }]}>{m.nome}</Text>
                  {m.avulso && <Text style={styles.avulso}>AVULSO</Text>}
                  {!editando && (
                    <Pressable
                      onPress={() => setMembros((a) => a.filter((_, j) => j !== i))}
                      hitSlop={10}
                      accessibilityLabel="Remover"
                    >
                      <MaterialCommunityIcons name="close-circle" size={22} color={cores.erro} />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.rotulo}>Função</Text>
                <Seletor
                  opcoes={FUNCOES}
                  valor={m.funcao}
                  aoEscolher={(v) => atualizarMembro(i, { funcao: v })}
                />
                <Text style={styles.rotulo}>Plantão</Text>
                <Seletor
                  opcoes={PLANTOES}
                  valor={m.tipoPlantao}
                  aoEscolher={(v) => atualizarMembro(i, { tipoPlantao: v })}
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Botao
            titulo={editando ? 'Atualizar' : 'Salvar equipe'}
            aoPressionar={salvar}
            carregando={salvando}
            desabilitado={membros.length === 0}
          />
        </View>
      </Folha>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  corpo: { flex: 1 },
  seletorData: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    padding: 8,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  setaData: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dataTexto: { fontSize: 14, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  dataSub: { fontSize: 11, color: cores.textoSecundario, marginTop: 2 },
  lista: { padding: 16, paddingTop: 8, gap: 12, paddingBottom: 32 },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 40, fontSize: 15 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  cartaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F7F9FC',
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  iconeVeiculo: {
    width: 44,
    height: 44,
    borderRadius: raios.md,
    backgroundColor: '#FDECEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descricao: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: cores.azul,
    backgroundColor: '#E8EEFB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  veiculoNome: { fontSize: 14, fontWeight: '800', color: cores.texto },
  veiculoSub: { fontSize: 11, color: cores.textoSuave },
  placa: {
    borderWidth: 2,
    borderColor: cores.marinho,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#fff',
  },
  placaTexto: { fontSize: 13, fontWeight: '800', color: cores.marinho, letterSpacing: 1 },
  cartaoCorpo: { padding: 12, gap: 8 },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: raios.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: cores.borda,
  },
  botaoAdicionarTexto: { fontSize: 12, fontWeight: '700', color: cores.textoSecundario },
  semMembros: { textAlign: 'center', color: cores.textoSuave, fontSize: 12, paddingVertical: 6 },
  membro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F9FC',
    borderRadius: raios.sm,
    padding: 8,
  },
  membroAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8EEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membroInicial: { fontSize: 12, fontWeight: '800', color: cores.azul },
  membroNomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  membroNome: { fontSize: 13, fontWeight: '700', color: cores.texto, flexShrink: 1 },
  membroSub: { fontSize: 11, color: cores.textoSuave, marginTop: 1 },
  avulso: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF5E0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  membroAcoes: { flexDirection: 'row', gap: 6 },
  botaoAcao: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abas: {
    flexDirection: 'row',
    backgroundColor: cores.fundo,
    borderRadius: raios.md,
    padding: 4,
    marginBottom: 14,
  },
  aba: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: raios.sm },
  abaAtiva: { backgroundColor: cores.superficie },
  abaTexto: { fontSize: 14, fontWeight: '600', color: cores.textoSecundario },
  abaTextoAtivo: { color: cores.vermelho, fontWeight: '800' },
  dica: { color: cores.textoSecundario, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  candidato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: raios.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: 8,
  },
  buscaPessoa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: 12,
    minHeight: 46,
    marginBottom: 8,
  },
  buscaEntrada: { flex: 1, fontSize: 15, color: cores.texto, paddingVertical: 10 },
  rotulo: { fontSize: 13, fontWeight: '600', color: cores.texto, marginTop: 10, marginBottom: 6 },
  rotuloSecao: { fontSize: 15, fontWeight: '800', color: cores.texto, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: '#FAFBFD',
  },
  chipAtivo: { backgroundColor: cores.vermelho, borderColor: cores.vermelho },
  chipTexto: { fontSize: 13, fontWeight: '600', color: cores.texto },
  chipTextoAtivo: { color: '#fff' },
  membroForm: {
    padding: 12,
    borderRadius: raios.md,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: 10,
  },
});