import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvisoFlutuante, { MensagemAviso } from '../componentes/AvisoFlutuante';
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import Carregando from '../componentes/Carregando';
import Folha from '../componentes/Folha';
import { useSessao } from '../contextos/SessaoContexto';
import {
  DiaEscala,
  EscalaMensal,
  TIPOS_DA_ESCALA,
  TipoEscala,
  escalaMensalServico,
} from '../servicos/escalaMensalServico';
import { UsuarioSistema, usuarioServico } from '../servicos/usuarioServico';
import { cores, raios } from '../tema/cores';
import { mensagemDeErro } from '../utilitarios/formatadores';
import type { ParametrosPrincipal } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'EscalaMensal'>;

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const ROTULO_PERFIL: Record<string, string> = {
  ROLE_SUPERADMIN: 'Superadmin',
  ROLE_ADMIN: 'Administrador',
  ROLE_ENFERMEIRO: 'Enfermeiro',
  ROLE_MEDICO: 'Médico',
  ROLE_TECNICO: 'Técnico',
  ROLE_CONDUTOR: 'Condutor',
  ROLE_ASSISTENTE: 'Assistente',
  ROLE_USUARIO: 'Usuário',
};

const tipoInfo = (tipo: TipoEscala) => TIPOS_DA_ESCALA.find((t) => t.value === tipo)!;

const chaveDia = (ano: number, mes: number, dia: number) =>
  `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

const dataBr = (iso: string) => iso.split('-').reverse().join('/');

interface Chip {
  id: number | null;
  usuarioId: number;
  nome: string;
  tipo: TipoEscala;
  pendente: boolean;
  removido: boolean;
  trocaSolicitada: boolean;
  origemTrocaTipo?: 'TROCA' | 'REPASSE' | null;
  origemTrocaCom?: string | null;
}

export default function EscalaMensalTela({ navigation }: Props) {
  const { usuario } = useSessao();
  const ehAdmin = !!(usuario?.roles?.includes('ROLE_ADMIN') || usuario?.roles?.includes('ROLE_SUPERADMIN'));
  const meuId = usuario?.id != null ? Number(usuario.id) : null;

  const hoje = new Date();
  const hojeIso = chaveDia(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());

  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [escalas, setEscalas] = useState<EscalaMensal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [selecionado, setSelecionado] = useState<UsuarioSistema | null>(null);
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [pincel, setPincel] = useState<TipoEscala | null>(null);
  const [pendentes, setPendentes] = useState<Record<string, TipoEscala | null>>({});
  const [salvando, setSalvando] = useState(false);

  const [diaAberto, setDiaAberto] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  const avisar = (texto: string, tipo: 'sucesso' | 'erro') =>
    setAviso({ texto, tipo, chave: Date.now() });

  const carregar = useCallback(async () => {
    try {
      setEscalas(await escalaMensalServico.listarPorMes(ano, mes));
    } catch {
      avisar('Erro ao carregar a escala do mês.', 'erro');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    setCarregando(true);
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!ehAdmin) return;
    usuarioServico
      .listarTodos()
      .then(setUsuarios)
      .catch(() => avisar('Erro ao carregar os usuários da unidade.', 'erro'));
  }, [ehAdmin]);

  const temPendencias = Object.keys(pendentes).length > 0;

  const descartarSeNecessario = (continuar: () => void) => {
    if (!temPendencias) return continuar();
    Alert.alert('Alterações não registradas', 'Deseja descartá-las?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          setPendentes({});
          continuar();
        },
      },
    ]);
  };

  const mudarMes = (delta: number) =>
    descartarSeNecessario(() => {
      const novo = new Date(ano, mes - 1 + delta, 1);
      setAno(novo.getFullYear());
      setMes(novo.getMonth() + 1);
    });

  const porDia = useMemo(() => {
    const mapa = new Map<string, EscalaMensal[]>();
    escalas.forEach((e) => mapa.set(e.data, [...(mapa.get(e.data) ?? []), e]));
    mapa.forEach((lista) => lista.sort((a, b) => a.nomeUsuario.localeCompare(b.nomeUsuario)));
    return mapa;
  }, [escalas]);

  const totalDias = new Date(ano, mes, 0).getDate();
  const celulas = useMemo(() => {
    const lista: (number | null)[] = Array(new Date(ano, mes - 1, 1).getDay()).fill(null);
    for (let d = 1; d <= totalDias; d++) lista.push(d);
    while (lista.length % 7 !== 0) lista.push(null);
    return lista;
  }, [ano, mes, totalDias]);

  const existenteDoSelecionado = (iso: string) =>
    selecionado ? (porDia.get(iso) ?? []).find((e) => e.usuarioId === Number(selecionado.id)) : undefined;

  const tipoEfetivo = (iso: string): TipoEscala | null =>
    iso in pendentes ? pendentes[iso] : (existenteDoSelecionado(iso)?.tipoEscala ?? null);

  const chipsDoDia = (iso: string): Chip[] => {
    const itens: Chip[] = (porDia.get(iso) ?? []).map((e) => ({
      id: e.id,
      usuarioId: e.usuarioId,
      nome: e.nomeUsuario,
      tipo: e.tipoEscala,
      pendente: false,
      removido: false,
      trocaSolicitada: !!e.trocaSolicitada,
      origemTrocaTipo: e.origemTrocaTipo ?? null,
      origemTrocaCom: e.origemTrocaCom ?? null,
    }));
    if (selecionado && iso in pendentes) {
      const p = pendentes[iso];
      const i = itens.findIndex((c) => c.usuarioId === Number(selecionado.id));
      if (p === null) {
        if (i >= 0) itens[i] = { ...itens[i], pendente: true, removido: true };
      } else if (i >= 0) {
        itens[i] = { ...itens[i], tipo: p, pendente: true };
      } else {
        itens.unshift({
          id: null,
          usuarioId: Number(selecionado.id),
          nome: selecionado.nome,
          tipo: p,
          pendente: true,
          removido: false,
          trocaSolicitada: false,
        });
      }
    }
    return itens;
  };

  const podePintar = ehAdmin && !!selecionado && !!pincel;

  const tocarDia = (dia: number) => {
    const iso = chaveDia(ano, mes, dia);
    if (podePintar) {
      const atual = tipoEfetivo(iso);
      const existente = existenteDoSelecionado(iso);
      const novo: TipoEscala | null = atual === pincel ? null : pincel;
      setPendentes((anterior) => {
        const proximo = { ...anterior };
        const igualAoSalvo = (novo === null && !existente) || (existente && novo === existente.tipoEscala);
        if (igualAoSalvo) delete proximo[iso];
        else proximo[iso] = novo;
        return proximo;
      });
      return;
    }
    if (ehAdmin && selecionado && !pincel) {
      avisar('Escolha um tipo de plantão na barra acima.', 'erro');
      return;
    }
    if (chipsDoDia(iso).length > 0) setDiaAberto(iso);
  };

  const registrar = async () => {
    if (!selecionado?.id || !temPendencias) return;
    const dias: DiaEscala[] = [];
    for (let d = 1; d <= totalDias; d++) {
      const tipo = tipoEfetivo(chaveDia(ano, mes, d));
      if (tipo) dias.push({ data: chaveDia(ano, mes, d), tipoEscala: tipo });
    }
    setSalvando(true);
    try {
      await escalaMensalServico.registrarMes(
        Number(selecionado.id),
        ano,
        mes,
        dias,
        usuario?.nomeCompleto || usuario?.username,
      );
      avisar('Escala registrada com sucesso!', 'sucesso');
      setPendentes({});
      await carregar();
    } catch {
      avisar('Erro ao registrar a escala.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const agirNaTroca = async (acao: 'solicitar' | 'cancelar' | 'assumir', chip: Chip) => {
    if (!chip.id || processando) return;
    setProcessando(true);
    try {
      if (acao === 'solicitar') {
        await escalaMensalServico.solicitarTroca(chip.id);
        avisar('Troca divulgada aos colegas.', 'sucesso');
      } else if (acao === 'cancelar') {
        await escalaMensalServico.cancelarTroca(chip.id);
        avisar('Divulgação da troca cancelada.', 'sucesso');
      } else {
        await escalaMensalServico.assumirTroca(chip.id);
        avisar(`Você assumiu o plantão de ${chip.nome}!`, 'sucesso');
      }
      setDiaAberto(null);
      await carregar();
    } catch (falha) {
      avisar(mensagemDeErro(falha, 'Não foi possível concluir a operação.'), 'erro');
    } finally {
      setProcessando(false);
    }
  };

  const perfis = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => (u.roles ?? []).forEach((r) => set.add(r)));
    return Array.from(set).sort((a, b) => (ROTULO_PERFIL[a] ?? a).localeCompare(ROTULO_PERFIL[b] ?? b));
  }, [usuarios]);

  const usuariosFiltrados = useMemo(
    () =>
      usuarios
        .filter((u) => !filtroPerfil || (u.roles ?? []).includes(filtroPerfil))
        .filter((u) => !busca || u.nome.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [usuarios, filtroPerfil, busca],
  );

  const chipsAbertos = diaAberto ? chipsDoDia(diaAberto) : [];
  const diaPassado = diaAberto ? diaAberto < hojeIso : false;

  return (
    <View style={styles.tela}>
      <Cabecalho titulo="Escala Mensal" subtitulo={usuario?.tenantNome} aoVoltar={() => navigation.goBack()} />

      <View style={{ flex: 1 }}>
        <AvisoFlutuante mensagem={aviso} />

        <ScrollView
          contentContainerStyle={styles.conteudo}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => {
                setAtualizando(true);
                carregar();
              }}
              tintColor={cores.vermelho}
            />
          }
        >
          <View style={styles.navegacaoMes}>
            <Pressable onPress={() => mudarMes(-1)} hitSlop={10} style={styles.seta} accessibilityLabel="Mês anterior">
              <MaterialCommunityIcons name="chevron-left" size={26} color={cores.texto} />
            </Pressable>
            <Text style={styles.mesTitulo}>
              {MESES[mes - 1]} {ano}
            </Text>
            <Pressable onPress={() => mudarMes(1)} hitSlop={10} style={styles.seta} accessibilityLabel="Próximo mês">
              <MaterialCommunityIcons name="chevron-right" size={26} color={cores.texto} />
            </Pressable>
          </View>

          <View style={styles.legenda}>
            {TIPOS_DA_ESCALA.map((t) => (
              <View key={t.value} style={styles.legendaItem}>
                <View style={[styles.legendaPonto, { backgroundColor: t.cor }]} />
                <Text style={styles.legendaTexto}>{t.label}</Text>
              </View>
            ))}
          </View>

          {ehAdmin && (
            <View style={styles.painelAdmin}>
              <Pressable onPress={() => setSeletorAberto(true)} style={styles.seletorUsuario}>
                <MaterialCommunityIcons name="account-edit" size={20} color={cores.azul} />
                <Text style={styles.seletorTexto} numberOfLines={1}>
                  {selecionado ? selecionado.nome : 'Escolher profissional para montar a escala'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={cores.textoSuave} />
              </Pressable>

              {selecionado && (
                <>
                  <Text style={styles.dica}>Escolha o tipo de plantão e toque nos dias do calendário.</Text>
                  <View style={styles.pinceis}>
                    {TIPOS_DA_ESCALA.map((t) => {
                      const ativo = pincel === t.value;
                      return (
                        <Pressable
                          key={t.value}
                          onPress={() => setPincel(ativo ? null : t.value)}
                          style={[styles.pincel, ativo && { backgroundColor: t.cor, borderColor: t.cor }]}
                        >
                          <Text style={[styles.pincelTexto, ativo && { color: '#fff' }]}>{t.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {temPendencias && (
                    <View style={styles.acoesPendentes}>
                      <View style={{ flex: 1 }}>
                        <Botao titulo="Registrar escala" aoPressionar={registrar} carregando={salvando} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Botao titulo="Descartar" aoPressionar={() => setPendentes({})} variante="secundario" />
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {carregando ? (
            <Carregando mensagem="Carregando escala..." />
          ) : (
            <View style={styles.calendario}>
              <View style={styles.linhaSemana}>
                {DIAS_SEMANA.map((d, i) => (
                  <Text key={i} style={styles.diaSemana}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.grade}>
                {celulas.map((dia, indice) => {
                  if (dia === null) return <View key={`v${indice}`} style={styles.celula} />;
                  const iso = chaveDia(ano, mes, dia);
                  const chips = chipsDoDia(iso);
                  const meu = chips.some((c) => c.usuarioId === meuId && !c.removido);
                  const ehHoje = iso === hojeIso;
                  const alterado = iso in pendentes;
                  const troca = chips.some((c) => c.trocaSolicitada);
                  return (
                    <Pressable
                      key={iso}
                      onPress={() => tocarDia(dia)}
                      style={[
                        styles.celula,
                        styles.celulaCheia,
                        meu && styles.celulaMinha,
                        ehHoje && styles.celulaHoje,
                        alterado && styles.celulaAlterada,
                      ]}
                    >
                      <View style={styles.celulaTopo}>
                        <Text style={[styles.numeroDia, ehHoje && { color: cores.vermelho }]}>{dia}</Text>
                        {troca && <View style={styles.seloTroca} />}
                      </View>
                      <View style={styles.faixas}>
                        {chips.slice(0, 4).map((c, i) => (
                          <View
                            key={`${c.usuarioId}-${i}`}
                            style={[
                              styles.faixa,
                              { backgroundColor: tipoInfo(c.tipo).cor },
                              c.removido && { opacity: 0.25 },
                              c.pendente && !c.removido && styles.faixaPendente,
                            ]}
                          />
                        ))}
                      </View>
                      {chips.length > 0 && <Text style={styles.contagem}>{chips.length}</Text>}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {!ehAdmin && (
            <Text style={styles.rodapeDica}>Toque em um dia para ver a equipe e solicitar ou assumir trocas.</Text>
          )}
        </ScrollView>
      </View>

      <Folha
        visivel={!!diaAberto}
        titulo={diaAberto ? dataBr(diaAberto) : ''}
        subtitulo={`${chipsAbertos.length} ${chipsAbertos.length === 1 ? 'profissional escalado' : 'profissionais escalados'}`}
        aoFechar={() => setDiaAberto(null)}
      >
        {chipsAbertos.map((chip, i) => {
          const tipo = tipoInfo(chip.tipo);
          const eMeu = chip.usuarioId === meuId;
          const podeSolicitar = eMeu && !!chip.id && !chip.trocaSolicitada && !diaPassado && !chip.pendente;
          const podeCancelar = eMeu && !!chip.id && chip.trocaSolicitada && !diaPassado;
          const podeAssumir = !eMeu && !!chip.id && chip.trocaSolicitada && !diaPassado && meuId !== null;
          return (
            <View key={`${chip.usuarioId}-${i}`} style={[styles.linhaChip, eMeu && styles.linhaChipMinha]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.chipNome}>
                  {chip.nome}
                  {eMeu ? ' (você)' : ''}
                </Text>
                {chip.origemTrocaTipo ? (
                  <Text style={styles.chipSub}>
                    {chip.origemTrocaTipo === 'TROCA' ? 'Troca' : 'Repasse'} com {chip.origemTrocaCom}
                  </Text>
                ) : null}
                {chip.trocaSolicitada ? <Text style={styles.trocaTexto}>Troca divulgada</Text> : null}
              </View>
              <View style={[styles.badgeTipo, { backgroundColor: tipo.fundo }]}>
                <Text style={[styles.badgeTipoTexto, { color: tipo.cor }]}>{tipo.label}</Text>
              </View>
              {podeSolicitar && (
                <Pressable disabled={processando} onPress={() => agirNaTroca('solicitar', chip)} style={[styles.acaoChip, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.acaoChipTexto, { color: '#B45309' }]}>Trocar</Text>
                </Pressable>
              )}
              {podeCancelar && (
                <Pressable disabled={processando} onPress={() => agirNaTroca('cancelar', chip)} style={[styles.acaoChip, { backgroundColor: cores.erroFundo }]}>
                  <Text style={[styles.acaoChipTexto, { color: cores.erro }]}>Cancelar</Text>
                </Pressable>
              )}
              {podeAssumir && (
                <Pressable
                  disabled={processando}
                  onPress={() =>
                    Alert.alert('Assumir plantão', `Assumir o plantão de ${chip.nome}?`, [
                      { text: 'Não', style: 'cancel' },
                      { text: 'Assumir', onPress: () => agirNaTroca('assumir', chip) },
                    ])
                  }
                  style={[styles.acaoChip, { backgroundColor: '#D1FAE5' }]}
                >
                  <Text style={[styles.acaoChipTexto, { color: '#047857' }]}>Assumir</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </Folha>

      <Folha
        visivel={seletorAberto}
        titulo="Escolher profissional"
        aoFechar={() => setSeletorAberto(false)}
      >
        <View style={styles.busca}>
          <MaterialCommunityIcons name="magnify" size={20} color={cores.textoSuave} />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por nome"
            placeholderTextColor={cores.textoSuave}
            style={styles.buscaEntrada}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {[{ id: '', nome: 'Todos' }, ...perfis.map((p) => ({ id: p, nome: ROTULO_PERFIL[p] ?? p.replace('ROLE_', '') }))].map((f) => {
            const ativo = filtroPerfil === f.id;
            return (
              <Pressable key={f.id || 'todos'} onPress={() => setFiltroPerfil(f.id)} style={[styles.filtro, ativo && styles.filtroAtivo]}>
                <Text style={[styles.filtroTexto, ativo && { color: '#fff' }]}>{f.nome}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {usuariosFiltrados.map((u) => (
          <Pressable
            key={u.id}
            onPress={() =>
              descartarSeNecessario(() => {
                setSelecionado(u);
                setSeletorAberto(false);
              })
            }
            style={[styles.linhaChip, selecionado?.id === u.id && styles.linhaChipMinha]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.chipNome}>{u.nome}</Text>
              <Text style={styles.chipSub}>
                {(u.roles ?? []).map((r) => ROTULO_PERFIL[r] ?? r.replace('ROLE_', '')).join(', ')}
              </Text>
            </View>
            {selecionado?.id === u.id && <MaterialCommunityIcons name="check-circle" size={22} color={cores.vermelho} />}
          </Pressable>
        ))}
      </Folha>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 14, paddingBottom: 32 },
  navegacaoMes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 8,
  },
  seta: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mesTitulo: { fontSize: 17, fontWeight: '800', color: cores.texto },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendaPonto: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { fontSize: 12, color: cores.textoSecundario, fontWeight: '600' },
  painelAdmin: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 12,
    gap: 10,
  },
  seletorUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  seletorTexto: { flex: 1, fontSize: 14, fontWeight: '600', color: cores.texto },
  dica: { fontSize: 12, color: cores.textoSecundario },
  pinceis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pincel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: '#FAFBFD',
  },
  pincelTexto: { fontSize: 13, fontWeight: '700', color: cores.texto },
  acoesPendentes: { flexDirection: 'row', gap: 10 },
  calendario: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 6,
  },
  linhaSemana: { flexDirection: 'row' },
  diaSemana: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '800', color: cores.textoSuave, paddingVertical: 6 },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: `${100 / 7}%`, aspectRatio: 0.82, padding: 2 },
  celulaCheia: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'space-between',
    padding: 4,
  },
  celulaMinha: { backgroundColor: '#FFF7E6', borderColor: '#F5C77A' },
  celulaHoje: { borderColor: cores.vermelho, borderWidth: 1.5 },
  celulaAlterada: { backgroundColor: '#EEF4FF', borderColor: cores.azul, borderStyle: 'dashed' },
  celulaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numeroDia: { fontSize: 13, fontWeight: '800', color: cores.texto },
  seloTroca: { width: 8, height: 8, borderRadius: 4, backgroundColor: cores.vermelho },
  faixas: { gap: 2 },
  faixa: { height: 4, borderRadius: 2 },
  faixaPendente: { borderWidth: 1, borderColor: '#fff' },
  contagem: { fontSize: 10, color: cores.textoSuave, fontWeight: '700', textAlign: 'right' },
  rodapeDica: { textAlign: 'center', color: cores.textoSuave, fontSize: 12 },
  linhaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: 8,
  },
  linhaChipMinha: { backgroundColor: '#FFF7E6', borderColor: '#F5C77A' },
  chipNome: { fontSize: 14, fontWeight: '700', color: cores.texto },
  chipSub: { fontSize: 11, color: cores.textoSuave, marginTop: 1 },
  trocaTexto: { fontSize: 11, fontWeight: '800', color: cores.vermelho, marginTop: 2 },
  badgeTipo: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeTipoTexto: { fontSize: 11, fontWeight: '800' },
  acaoChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  acaoChipTexto: { fontSize: 12, fontWeight: '800' },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: 12,
    minHeight: 46,
    marginBottom: 10,
  },
  buscaEntrada: { flex: 1, fontSize: 15, color: cores.texto, paddingVertical: 10 },
  filtros: { gap: 8, paddingBottom: 12 },
  filtro: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie },
  filtroAtivo: { backgroundColor: cores.marinho, borderColor: cores.marinho },
  filtroTexto: { fontSize: 13, fontWeight: '600', color: cores.texto },
});