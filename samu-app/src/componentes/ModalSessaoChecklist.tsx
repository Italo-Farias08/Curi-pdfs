import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from './Botao';
import BotaoSituacao from './BotaoSituacao';
import { cores, raios } from '../tema/cores';
import type { ItemAvaliado, Situacao } from '../tipos/checklist';

interface Props {
  visivel: boolean;
  sessao: string | null;
  itens: ItemAvaliado[];
  aoEscolher: (idItem: number, situacao: Situacao) => void;
  aoFechar: () => void;
}

const BORDAS: Record<Situacao, string> = { P: '#BBF7D0', Q: '#FDE68A', F: '#FECDD3' };

export default function ModalSessaoChecklist({ visivel, sessao, itens, aoEscolher, aoFechar }: Props) {
  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <View style={styles.tela}>
        <View style={styles.topo}>
          <Text style={styles.titulo} numberOfLines={2}>
            {sessao}
          </Text>
          <Pressable onPress={aoFechar} hitSlop={12} accessibilityLabel="Fechar">
            <MaterialCommunityIcons name="close" size={26} color={cores.texto} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.lista}>
          {itens.map((item) => (
            <View key={item.id} style={[styles.item, { borderColor: BORDAS[item.situacao] }]}>
              <Text style={styles.nome}>{item.nomeItem}</Text>
              <View style={styles.botoes}>
                {(['P', 'Q', 'F'] as Situacao[]).map((situacao) => (
                  <BotaoSituacao
                    key={situacao}
                    situacao={situacao}
                    atual={item.situacao}
                    aoPressionar={() => aoEscolher(item.id, situacao)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.rodape}>
          <Botao titulo="Concluir sessão" aoPressionar={aoFechar} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    paddingTop: 48,
    backgroundColor: cores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  titulo: { flex: 1, fontSize: 18, fontWeight: '800', color: cores.texto },
  lista: { padding: 16, gap: 12 },
  item: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1.5,
    padding: 12,
    gap: 10,
  },
  nome: { fontSize: 15, fontWeight: '600', color: cores.texto },
  botoes: { flexDirection: 'row', gap: 8 },
  rodape: {
    padding: 16,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
});
