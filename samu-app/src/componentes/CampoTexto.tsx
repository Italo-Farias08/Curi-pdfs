import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores, raios } from '../tema/cores';
import type { NomeIcone } from '../dados/servicos';

interface Props extends Omit<TextInputProps, 'style'> {
  rotulo: string;
  senha?: boolean;
  icone?: NomeIcone;
}

export default function CampoTexto({ rotulo, senha = false, icone, ...resto }: Props) {
  const [oculta, setOculta] = useState(senha);
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={[styles.caixa, focado && styles.caixaFocada]}>
        {icone && (
          <MaterialCommunityIcons
            name={icone}
            size={20}
            color={focado ? cores.azul : cores.textoSuave}
            style={styles.icone}
          />
        )}
        <TextInput
          {...resto}
          secureTextEntry={oculta}
          placeholderTextColor={cores.textoSuave}
          onFocus={(evento) => {
            setFocado(true);
            resto.onFocus?.(evento);
          }}
          onBlur={(evento) => {
            setFocado(false);
            resto.onBlur?.(evento);
          }}
          style={styles.entrada}
        />
        {senha && (
          <Pressable
            onPress={() => setOculta((valor) => !valor)}
            hitSlop={10}
            accessibilityLabel={oculta ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <MaterialCommunityIcons
              name={oculta ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={cores.textoSecundario}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: 16 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  caixaFocada: { borderColor: cores.azul, backgroundColor: '#F5F8FF' },
  icone: { marginRight: 10 },
  entrada: { flex: 1, fontSize: 16, color: cores.texto, paddingVertical: 12 },
});