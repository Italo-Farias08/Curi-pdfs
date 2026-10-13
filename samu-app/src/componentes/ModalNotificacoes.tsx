import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores, raios } from '../tema/cores';
import { formatarDataSegura } from '../utilitarios/dataHora';
import type { Notificacao } from '../tipos/autenticacao';

interface Props {
  visivel: boolean;
  pendentes: Notificacao[];
  totalInicial: number;
  processando: boolean;
  aoConfirmar: (id: number) => void;
}

export default function ModalNotificacoes({
  visivel,
  pendentes,
  totalInicial,
  processando,
  aoConfirmar,
}: Props) {
  if (!visivel || pendentes.length === 0) return null;

  const atual = pendentes[0];
  const restam = pendentes.length;
  const posicao = Math.max(1, totalInicial - restam + 1);
  const ehUltima = restam === 1;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.fundo}>
        <View style={styles.janela}>
          <ScrollView contentContainerStyle={styles.conteudo}>
            <View style={styles.topo}>
              <View style={styles.tituloGrupo}>
                <LinearGradient
                  colors={cores.gradiente}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.medalhao}
                >
                  <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
                </LinearGradient>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.titulo}>Notificações Pendentes</Text>
                  {totalInicial > 1 && (
                    <View style={styles.contador}>
                      <Text style={styles.contadorTexto}>
                        {posicao} de {totalInicial}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.etiquetaNaoLida}>
                <View style={styles.ponto} />
                <Text style={styles.etiquetaTexto}>Não lida</Text>
              </View>
            </View>

            {totalInicial > 1 && (
              <View style={styles.progresso}>
                {Array.from({ length: totalInicial }).map((_, indice) => (
                  <View
                    key={indice}
                    style={[
                      styles.segmento,
                      { backgroundColor: indice < posicao ? '#F43F5E' : cores.borda },
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={styles.cartao}>
              <Linha icone="account-outline" rotulo="De" valor={atual.criadoPor} destaque />
              <Linha icone="send-outline" rotulo="Para" valor={atual.nomeCompleto} destaque />
              {atual.origemEnvio ? (
                <Linha
                  icone="shield-check-outline"
                  rotulo="Enviada por"
                  valor={atual.origemEnvio}
                  destaque
                  cor="#6366F1"
                />
              ) : null}
              <Linha
                icone="calendar-outline"
                rotulo="Enviada em"
                valor={formatarDataSegura(atual.momentoCriacao)}
              />

              <View style={styles.mensagemCaixa}>
                {atual.assunto ? <Text style={styles.assunto}>{atual.assunto}</Text> : null}
                <Text style={styles.mensagem}>“{atual.mensagem}”</Text>
              </View>
            </View>

            <View style={styles.aviso}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={cores.textoSuave} />
              <Text style={styles.avisoTexto}>
                Ao tocar no botão, esta notificação será marcada como lida
                {!ehUltima ? ' e a próxima será exibida' : ''}.
              </Text>
            </View>

            <Pressable
              onPress={() => aoConfirmar(atual.id)}
              disabled={processando}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.botao,
                { opacity: processando ? 0.55 : pressed ? 0.88 : 1 },
              ]}
            >
              <LinearGradient
                colors={cores.gradiente}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.botaoGradiente}
              >
                {!processando && <MaterialCommunityIcons name="check" size={20} color="#fff" />}
                <Text style={styles.botaoTexto}>
                  {processando ? 'Processando...' : ehUltima ? 'Concluir' : 'OK, próxima'}
                </Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface LinhaProps {
  icone: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  rotulo: string;
  valor: string;
  destaque?: boolean;
  cor?: string;
}

function Linha({ icone, rotulo, valor, destaque = false, cor }: LinhaProps) {
  const corTexto = cor ?? (destaque ? cores.textoSecundario : cores.textoSuave);
  return (
    <View style={styles.linha}>
      <MaterialCommunityIcons name={icone} size={15} color={corTexto} />
      <Text style={[styles.linhaTexto, { color: corTexto }]}>
        {rotulo}:{' '}
        <Text style={destaque ? styles.linhaValor : undefined}>{valor}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  janela: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: cores.superficie,
    borderRadius: 20,
    overflow: 'hidden',
  },
  conteudo: { padding: 20 },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  tituloGrupo: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  medalhao: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.texto },
  contador: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: cores.marinho,
    borderRadius: raios.circulo,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  contadorTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  etiquetaNaoLida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE4E6',
    borderRadius: raios.circulo,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F43F5E' },
  etiquetaTexto: { color: '#BE123C', fontSize: 11, fontWeight: '700' },
  progresso: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  segmento: { flex: 1, height: 6, borderRadius: 3 },
  cartao: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  linhaTexto: { fontSize: 12, flexShrink: 1 },
  linhaValor: { fontWeight: '700', color: cores.texto },
  mensagemCaixa: {
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assunto: { fontSize: 13, fontWeight: '700', color: '#9F1239', marginBottom: 4 },
  mensagem: { fontSize: 18, fontWeight: '700', color: '#BE123C', lineHeight: 24 },
  aviso: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  avisoTexto: { flex: 1, fontSize: 11, color: cores.textoSuave },
  botao: { marginTop: 16, borderRadius: raios.md, overflow: 'hidden' },
  botaoGradiente: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
