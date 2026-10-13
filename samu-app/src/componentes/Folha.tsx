import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../tema/cores';

interface Props {
  visivel: boolean;
  titulo: string;
  subtitulo?: string;
  aoFechar: () => void;
  children: React.ReactNode;
}

/** Janela que sobe de baixo (bottom sheet) para formulários e confirmações. */
export default function Folha({ visivel, titulo, subtitulo, aoFechar, children }: Props) {
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <KeyboardAvoidingView
        style={styles.fundo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} accessibilityLabel="Fechar" />
        <View style={styles.folha}>
          <View style={styles.alca} />
          <View style={styles.topo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{titulo}</Text>
              {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
            </View>
            <Pressable onPress={aoFechar} hitSlop={12} accessibilityLabel="Fechar">
              <MaterialCommunityIcons name="close" size={24} color={cores.textoSecundario} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11,22,51,0.55)' },
  folha: {
    backgroundColor: cores.superficie,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.borda,
    marginTop: 8,
  },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  titulo: { fontSize: 18, fontWeight: '800', color: cores.texto },
  subtitulo: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  conteudo: { padding: 20, paddingBottom: 32 },
});