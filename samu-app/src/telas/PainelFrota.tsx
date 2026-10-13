import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AvisoFlutuante, { MensagemAviso } from '../componentes/AvisoFlutuante';
import { Entrada, PontoVivo } from '../componentes/Animados';
import Botao from '../componentes/Botao';
import Cabecalho from '../componentes/Cabecalho';
import CampoTexto from '../componentes/CampoTexto';
import Carregando from '../componentes/Carregando';
import Folha from '../componentes/Folha';
import { URL_BASE_API } from '../config/ambiente';
import { useSessao } from '../contextos/SessaoContexto';
import { VeiculoDoPainel, frotaServico } from '../servicos/frotaServico';
import { cores, raios } from '../tema/cores';
import { mensagemDeErro } from '../utilitarios/formatadores';
import type { ParametrosPrincipal } from '../navegacao/tipos';

type Props = NativeStackScreenProps<ParametrosPrincipal, 'PainelFrota'>;

const STATUS = {
  'EM USO': { titulo: 'Em Missão', cor: '#E11D48', fundo: '#FFE4E6', rotulo: 'Em Uso' },
  DISPONIVEL: { titulo: 'Disponíveis', cor: '#15803D', fundo: '#DCFCE7', rotulo: 'Disponível' },
  RESERVADO: { titulo: 'Reservados', cor: '#64748B', fundo: '#E2E8F0', rotulo: 'Reservado' },
  'EM MANUTENCAO': { titulo: 'Em Manutenção', cor: '#CA8A04', fundo: '#FEF9C3', rotulo: 'Manutenção' },
} as const;

type ChaveStatus = keyof typeof STATUS;
const ORDEM: ChaveStatus[] = ['EM USO', 'DISPONIVEL', 'RESERVADO', 'EM MANUTENCAO'];
const STATUS_EDITAVEIS: ChaveStatus[] = ['DISPONIVEL', 'RESERVADO', 'EM MANUTENCAO'];

const chaveDoStatus = (v: VeiculoDoPainel): ChaveStatus =>
  v.statusDoVeiculo && v.statusDoVeiculo in STATUS ? (v.statusDoVeiculo as ChaveStatus) : 'DISPONIVEL';

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export default function PainelFrota({ navigation }: Props) {
  const { usuario } = useSessao();
  const somenteLeitura = usuario?.roles?.includes('ROLE_VISUALIZADOR') ?? false;
  const podeFecharMapa = usuario?.roles?.includes('ROLE_ADMIN') ?? false;

  const [veiculos, setVeiculos] = useState<VeiculoDoPainel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [aviso, setAviso] = useState<MensagemAviso | null>(null);
  const [alternando, setAlternando] = useState<string[]>([]);

  const [alvoStatus, setAlvoStatus] = useState<VeiculoDoPainel | null>(null);
  const [novoStatus, setNovoStatus] = useState<ChaveStatus>('DISPONIVEL');
  const [situacao, setSituacao] = useState('');
  const [condutor, setCondutor] = useState('');
  const [cpfCondutor, setCpfCondutor] = useState('');

  const [alvoMapa, setAlvoMapa] = useState<VeiculoDoPainel | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [erroFormulario, setErroFormulario] = useState('');
  const [salvando, setSalvando] = useState(false);

  const avisar = (texto: string, tipo: 'sucesso' | 'erro') =>
    setAviso({ texto, tipo, chave: Date.now() });

  const buscar = useCallback(async () => {
    try {
      setVeiculos(await frotaServico.listar());
    } catch {
      setVeiculos([]);
      avisar('Erro ao carregar os veículos.', 'erro');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const alternarOcorrencia = async (v: VeiculoDoPainel) => {
    const exibindoAgora = v.exibirEmOcorrencia !== false;
    const novoValor = !exibindoAgora;
    setAlternando((a) => [...a, v.placa]);
    setVeiculos((lista) => lista.map((x) => (x.id === v.id ? { ...x, exibirEmOcorrencia: novoValor } : x)));
    try {
      await frotaServico.definirExibicaoEmOcorrencia(v.id, novoValor);
      avisar(
        novoValor
          ? `${v.placa} agora aparece no Registro de Ocorrência.`
          : `${v.placa} foi retirada do Registro de Ocorrência.`,
        'sucesso',
      );
    } catch {
      setVeiculos((lista) => lista.map((x) => (x.id === v.id ? { ...x, exibirEmOcorrencia: exibindoAgora } : x)));
      avisar(`Não foi possível alterar a viatura ${v.placa}.`, 'erro');
    } finally {
      setAlternando((a) => a.filter((p) => p !== v.placa));
    }
  };

  const abrirStatus = (v: VeiculoDoPainel) => {
    setAlvoStatus(v);
    setNovoStatus(chaveDoStatus(v));
    setSituacao(v.situacao ?? '');
    setCondutor(v.motorista ?? '');
    setCpfCondutor(v.cpfMotorista ?? '');
    setErroFormulario('');
  };

  const salvarStatus = async () => {
    if (!alvoStatus) return;
    const livre = novoStatus === 'DISPONIVEL';
    setSalvando(true);
    try {
      await frotaServico.mudarStatus(alvoStatus.placa, {
        statusDoVeiculo: novoStatus,
        situacao: livre ? '' : situacao,
        motorista: livre ? '' : condutor,
        cpfMotorista: livre ? '' : cpfCondutor,
        idMapa: 0,
      });
      setAlvoStatus(null);
      avisar('Status atualizado com sucesso!', 'sucesso');
      buscar();
    } catch (falha) {
      setErroFormulario(mensagemDeErro(falha, 'Erro ao atualizar o status do veículo.'));
    } finally {
      setSalvando(false);
    }
  };

  const abrirMapa = (v: VeiculoDoPainel) => {
    setAlvoMapa(v);
    setObservacoes('');
    setErroFormulario('');
  };

  const encerrarMapa = async () => {
    if (!alvoMapa) return;
    const km = parseFloat(String(alvoMapa.km ?? '').replace(',', '.'));
    if (isNaN(km)) {
      setErroFormulario('O veículo não tem KM válido para encerrar o mapa.');
      return;
    }
    const agora = new Date();
    setSalvando(true);
    try {
      await frotaServico.fecharMapa(alvoMapa.idMapa, {
        dataFinal: `${doisDigitos(agora.getDate())}/${doisDigitos(agora.getMonth() + 1)}/${agora.getFullYear()}`,
        horaFinal: `${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`,
        kmInicio: Number(km.toFixed(1)),
        kmFinal: Number(km.toFixed(1)),
        observacoes,
        destino: alvoMapa.situacao,
        kmsPercorridos: 0,
      });
      await frotaServico.mudarStatus(alvoMapa.placa, {
        statusDoVeiculo: 'DISPONIVEL',
        motorista: '',
        cpfMotorista: '',
        situacao: '',
        km: alvoMapa.km,
        idMapa: 0,
      });
      setAlvoMapa(null);
      avisar('Mapa encerrado com sucesso!', 'sucesso');
      buscar();
    } catch (falha) {
      setErroFormulario(mensagemDeErro(falha, 'Ocorreu um erro ao tentar fechar o mapa.'));
    } finally {
      setSalvando(false);
    }
  };

  const cartao = (v: VeiculoDoPainel) => {
    const chave = chaveDoStatus(v);
    const tom = STATUS[chave];
    const naOcorrencia = v.exibirEmOcorrencia !== false;
    const salvandoEste = alternando.includes(v.placa);
    return (
      <View key={v.id} style={[styles.cartao, { borderColor: tom.cor }]}>
        <View style={[styles.selo, { backgroundColor: tom.fundo }]}>
          <Text style={[styles.seloTexto, { color: tom.cor }]}>{tom.rotulo}</Text>
        </View>

        <View style={styles.imagem}>
          {v.imagemUrl ? (
            <Image source={{ uri: `${URL_BASE_API}${v.imagemUrl}` }} style={styles.foto} resizeMode="contain" />
          ) : (
            <MaterialCommunityIcons name="ambulance" size={44} color={cores.textoSuave} />
          )}
        </View>

        <View style={styles.placa}>
          <Text style={styles.placaTexto}>{v.placa}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.modelo} numberOfLines={1}>{v.modelo}</Text>
          {v.motorista?.trim() ? <Text style={styles.detalhe} numberOfLines={1}>{v.motorista}</Text> : null}
          {v.destino?.trim() ? (
            <Text style={styles.destino} numberOfLines={1}>
              <Text style={styles.detalhe}>Destino: </Text>
              {v.destino}
            </Text>
          ) : null}
          {Number(v.idMapa) > 0 ? <Text style={styles.mapa}>Mapa #{v.idMapa}</Text> : null}
        </View>

        {!somenteLeitura && (
          <Pressable
            disabled={salvandoEste}
            onPress={() => alternarOcorrencia(v)}
            style={[styles.botaoPequeno, naOcorrencia ? styles.naOcorrencia : styles.foraOcorrencia, salvandoEste && { opacity: 0.5 }]}
          >
            <Text style={[styles.botaoPequenoTexto, { color: naOcorrencia ? cores.azul : cores.textoSecundario }]}>
              {salvandoEste ? 'Salvando...' : naOcorrencia ? '✓ Na Ocorrência' : '✕ Fora da Ocorrência'}
            </Text>
          </Pressable>
        )}

        {!somenteLeitura && chave !== 'EM USO' && (
          <Pressable onPress={() => abrirStatus(v)} style={[styles.botaoPequeno, { backgroundColor: '#16A34A' }]}>
            <Text style={[styles.botaoPequenoTexto, { color: '#fff' }]}>Mudar status</Text>
          </Pressable>
        )}
        {!somenteLeitura && chave === 'EM USO' && podeFecharMapa && (
          <Pressable onPress={() => abrirMapa(v)} style={[styles.botaoPequeno, { backgroundColor: '#CA8A04' }]}>
            <Text style={[styles.botaoPequenoTexto, { color: '#fff' }]}>Fechar mapa</Text>
          </Pressable>
        )}
        {chave === 'EM USO' && !podeFecharMapa && (
          <View style={[styles.botaoPequeno, { backgroundColor: '#FFE4E6' }]}>
            <Text style={[styles.botaoPequenoTexto, { color: '#BE123C' }]}>Em missão</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.tela}>
      <Cabecalho titulo="Painel da Frota" subtitulo={usuario?.tenantNome} aoVoltar={() => navigation.goBack()} />

      <View style={{ flex: 1 }}>
        <AvisoFlutuante mensagem={aviso} />
        {carregando ? (
          <Carregando mensagem="Carregando frota..." />
        ) : (
          <ScrollView
            contentContainerStyle={styles.lista}
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={() => {
                  setAtualizando(true);
                  buscar();
                }}
                tintColor={cores.vermelho}
              />
            }
          >
            <View style={styles.resumo}>
              {ORDEM.map((chave) => {
                const total = veiculos.filter((v) => chaveDoStatus(v) === chave).length;
                return (
                  <View key={chave} style={[styles.resumoItem, { backgroundColor: STATUS[chave].fundo }]}>
                    <Text style={[styles.resumoNumero, { color: STATUS[chave].cor }]}>{total}</Text>
                    <Text style={[styles.resumoRotulo, { color: STATUS[chave].cor }]}>{STATUS[chave].rotulo}</Text>
                  </View>
                );
              })}
            </View>

            {veiculos.length === 0 && <Text style={styles.vazio}>Nenhum veículo cadastrado.</Text>}

            {ORDEM.map((chave, indice) => {
              const doGrupo = veiculos.filter((v) => chaveDoStatus(v) === chave);
              if (doGrupo.length === 0) return null;
              const tom = STATUS[chave];
              return (
                <Entrada key={chave} atraso={indice * 80} deslocamento={16}>
                  <View style={styles.cabecalhoGrupo}>
                    <View style={[styles.linha, { backgroundColor: tom.cor }]} />
                    <View style={[styles.tituloGrupo, { backgroundColor: tom.cor }]}>
                      {chave === 'EM USO' && <PontoVivo cor="#fff" tamanho={6} />}
                      <Text style={styles.tituloGrupoTexto}>{tom.titulo}</Text>
                    </View>
                    <View style={[styles.linha, { backgroundColor: tom.cor }]} />
                  </View>
                  <View style={styles.grade}>{doGrupo.map(cartao)}</View>
                </Entrada>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Folha
        visivel={!!alvoStatus}
        titulo={`Alterar status - ${alvoStatus?.modelo ?? ''}`}
        subtitulo={`Placa ${alvoStatus?.placa ?? ''}`}
        aoFechar={() => setAlvoStatus(null)}
      >
        <Text style={styles.rotulo}>Status</Text>
        <View style={styles.opcoes}>
          {STATUS_EDITAVEIS.map((chave) => {
            const ativo = novoStatus === chave;
            return (
              <Pressable
                key={chave}
                onPress={() => setNovoStatus(chave)}
                style={[styles.opcao, ativo && { backgroundColor: STATUS[chave].cor, borderColor: STATUS[chave].cor }]}
              >
                <Text style={[styles.opcaoTexto, ativo && { color: '#fff' }]}>{STATUS[chave].rotulo}</Text>
              </Pressable>
            );
          })}
        </View>

        {novoStatus !== 'DISPONIVEL' && (
          <View style={{ marginTop: 14 }}>
            <CampoTexto rotulo="Situação (opcional)" value={situacao} onChangeText={setSituacao} />
            <CampoTexto rotulo="Condutor (opcional)" value={condutor} onChangeText={setCondutor} />
            <CampoTexto
              rotulo="CPF do condutor (opcional)"
              value={cpfCondutor}
              onChangeText={setCpfCondutor}
              keyboardType="number-pad"
            />
          </View>
        )}

        {erroFormulario ? <Text style={styles.erro}>{erroFormulario}</Text> : null}
        <Botao titulo="Salvar" aoPressionar={salvarStatus} carregando={salvando} />
      </Folha>

      <Folha
        visivel={!!alvoMapa}
        titulo={`Encerrar mapa - ${alvoMapa?.modelo ?? ''}`}
        subtitulo={`Placa ${alvoMapa?.placa ?? ''} • Condutor: ${alvoMapa?.motorista || '—'}`}
        aoFechar={() => setAlvoMapa(null)}
      >
        <CampoTexto rotulo="Observação (opcional)" value={observacoes} onChangeText={setObservacoes} />
        {erroFormulario ? <Text style={styles.erro}>{erroFormulario}</Text> : null}
        <Botao titulo="Encerrar mapa" aoPressionar={encerrarMapa} carregando={salvando} variante="perigo" />
      </Folha>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: 16, gap: 20, paddingBottom: 32 },
  vazio: { textAlign: 'center', color: cores.textoSecundario, marginTop: 40, fontSize: 15 },
  resumo: { flexDirection: 'row', gap: 8 },
  resumoItem: { flex: 1, borderRadius: raios.md, paddingVertical: 10, alignItems: 'center' },
  resumoNumero: { fontSize: 22, fontWeight: '900' },
  resumoRotulo: { fontSize: 10, fontWeight: '700' },
  cabecalhoGrupo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  linha: { flex: 1, height: 3, borderRadius: 2 },
  tituloGrupo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  tituloGrupoTexto: { color: '#fff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cartao: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 2,
    overflow: 'hidden',
    paddingBottom: 8,
    gap: 6,
  },
  selo: { position: 'absolute', top: 6, right: 6, zIndex: 2, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  seloTexto: { fontSize: 9, fontWeight: '800' },
  imagem: { height: 90, backgroundColor: '#F7F9FC', alignItems: 'center', justifyContent: 'center', padding: 4 },
  foto: { width: '100%', height: '100%' },
  placa: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: cores.marinho,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  placaTexto: { fontSize: 14, fontWeight: '800', color: cores.marinho, letterSpacing: 1 },
  info: { paddingHorizontal: 10, gap: 1 },
  modelo: { fontSize: 12, fontWeight: '800', color: cores.texto },
  detalhe: { fontSize: 11, color: cores.textoSuave },
  destino: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  mapa: { fontSize: 10, color: cores.textoSuave },
  botaoPequeno: {
    marginHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  naOcorrencia: { backgroundColor: '#E8EEFB', borderColor: '#BFD0F5' },
  foraOcorrencia: { backgroundColor: '#F1F5F9', borderColor: cores.borda },
  botaoPequenoTexto: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 8 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: '#FAFBFD',
  },
  opcaoTexto: { fontSize: 13, fontWeight: '700', color: cores.texto },
  erro: { color: cores.erro, fontWeight: '700', marginBottom: 12, fontSize: 14 },
});