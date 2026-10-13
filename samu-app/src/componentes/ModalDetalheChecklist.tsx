import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from './Botao';
import { cores, raios } from '../tema/cores';
import { formatarDataSegura } from '../utilitarios/dataHora';
import { ROTULO_SITUACAO } from '../utilitarios/checklist';
import { identificacaoVeiculo } from '../utilitarios/veiculo';
import type { ChecklistRealizado, Situacao } from '../tipos/checklist';

interface Props {
  checklist: ChecklistRealizado | null;
  aoFechar: () => void;
}

const FUNDOS: Record<Situacao, string> = { P: '#DCFCE7', Q: '#FEF9C3', F: '#FFE4E6' };
const TEXTOS: Record<Situacao, string> = { P: '#15803D', Q: '#A16207', F: '#BE123C' };

export default function ModalDetalheChecklist({ checklist, aoFechar }: Props) {
  return (
    <Modal visible={!!checklist} animationType="slide" onRequestClose={aoFechar}>
      {checklist && (
        <View style={styles.tela}>
          <View style={styles.topo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>
                {checklist.placa} — {identificacaoVeiculo(checklist)}
              </Text>
              <Text style={styles.sub}>
                {checklist.status} · {formatarDataSegura(checklist.dataCriacao)}
              </Text>
            </View>
            <Pressable onPress={aoFechar} hitSlop={12} accessibilityLabel="Fechar">
              <MaterialCommunityIcons name="close" size={26} color={cores.texto} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.conteudo}>
            {checklist.observacoes ? (
              <View style={styles.observacoes}>
                <Text style={styles.rotulo}>Observações</Text>
                <Text style={styles.texto}>{checklist.observacoes}</Text>
              </View>
            ) : null}

            <Text style={styles.secao}>Itens com problema</Text>
            {checklist.itens.length === 0 ? (
              <Text style={styles.vazio}>Nenhum item com problema neste checklist.</Text>
            ) : (
              checklist.itens.map((item) => {
                const situacao: Situacao = item.situacao ?? 'P';
                return (
                  <View key={item.id} style={styles.linha}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nomeItem}>{item.nomeItem}</Text>
                      <Text style={styles.sessao}>{item.sessao}</Text>
                    </View>
                    <View style={[styles.selo, { backgroundColor: FUNDOS[situacao] }]}>
                      <Text style={[styles.seloTexto, { color: TEXTOS[situacao] }]}>
                        {ROTULO_SITUACAO[situacao]}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.rodape}>
            <Botao titulo="Fechar" aoPressionar={aoFechar} variante="secundario" />
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingTop: 48,
    backgroundColor: cores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  titulo: { fontSize: 18, fontWeight: '800', color: cores.texto },
  sub: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  conteudo: { padding: 16, gap: 10 },
  observacoes: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  rotulo: { fontSize: 12, color: cores.textoSuave, marginBottom: 4 },
  texto: { fontSize: 15, color: cores.texto },
  secao: { fontSize: 15, fontWeight: '800', color: cores.texto, marginTop: 6 },
  vazio: { fontSize: 14, color: cores.textoSecundario },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  nomeItem: { fontSize: 15, fontWeight: '600', color: cores.texto },
  sessao: { fontSize: 12, color: cores.textoSecundario, marginTop: 2 },
  selo: { borderRadius: raios.circulo, paddingHorizontal: 10, paddingVertical: 4 },
  seloTexto: { fontSize: 12, fontWeight: '700' },
  rodape: {
    padding: 16,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
});
