import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

/** Entrada suave: aparece subindo (fade + deslocamento), com atraso opcional. */
export function Entrada({
  children,
  atraso = 0,
  deslocamento = 24,
  estilo,
}: {
  children: React.ReactNode;
  atraso?: number;
  deslocamento?: number;
  estilo?: StyleProp<ViewStyle>;
}) {
  const valor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(valor, {
      toValue: 1,
      duration: 520,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [valor, atraso]);

  return (
    <Animated.View
      style={[
        estilo,
        {
          opacity: valor,
          transform: [
            { translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [deslocamento, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Anéis que se expandem e somem, como um sinal de rádio / sirene. */
export function Ondas({
  tamanho,
  cor = 'rgba(255,255,255,0.35)',
  quantidade = 3,
}: {
  tamanho: number;
  cor?: string;
  quantidade?: number;
}) {
  const valores = useRef(Array.from({ length: quantidade }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const animacoes = valores.map((valor, indice) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(indice * 900),
          Animated.timing(valor, {
            toValue: 1,
            duration: 2700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animacoes.forEach((animacao) => animacao.start());
    return () => animacoes.forEach((animacao) => animacao.stop());
  }, [valores]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, estilos.centro]}>
      {valores.map((valor, indice) => (
        <Animated.View
          key={indice}
          style={{
            position: 'absolute',
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            borderWidth: 2,
            borderColor: cor,
            opacity: valor.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }),
            transform: [
              { scale: valor.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** Batimento cardíaco: barras que formam um eletrocardiograma em movimento. */
const PERFIL_ECG = [4, 4, 6, 4, 4, 10, 4, 4, 4, 18, 44, 8, 26, 4, 4, 8, 14, 8, 4, 4, 4, 4, 6, 4];

export function Eletrocardiograma({ cor = 'rgba(255,255,255,0.85)' }: { cor?: string }) {
  const varredura = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.timing(varredura, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [varredura]);

  return (
    <View style={estilos.ecg}>
      {PERFIL_ECG.map((altura, indice) => {
        const posicao = indice / PERFIL_ECG.length;
        // Cada barra "acende" quando a varredura passa por ela.
        const opacidade = varredura.interpolate({
          inputRange: [
            Math.max(0, posicao - 0.3),
            posicao,
            Math.min(1, posicao + 0.001),
            1,
          ],
          outputRange: [0.18, 1, 0.45, 0.18],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={indice}
            style={{
              width: 4,
              height: altura,
              borderRadius: 2,
              backgroundColor: cor,
              opacity: opacidade,
            }}
          />
        );
      })}
    </View>
  );
}

/** Ponto que pulsa suavemente (indicador "ao vivo"). */
export function PontoVivo({ cor = '#34D399', tamanho = 9 }: { cor?: string; tamanho?: number }) {
  const valor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.timing(valor, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [valor]);

  return (
    <View style={{ width: tamanho * 2.4, height: tamanho * 2.4, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho,
          backgroundColor: cor,
          opacity: valor.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
          transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
        }}
      />
      <View style={{ width: tamanho, height: tamanho, borderRadius: tamanho, backgroundColor: cor }} />
    </View>
  );
}

/** Pressable que encolhe levemente ao toque, com mola. */
export function ToqueMola({
  children,
  estilo,
  escala = 0.96,
  ...resto
}: Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  estilo?: StyleProp<ViewStyle>;
  escala?: number;
}) {
  const valor = useRef(new Animated.Value(1)).current;

  const mover = (alvo: number) =>
    Animated.spring(valor, {
      toValue: alvo,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      {...resto}
      onPressIn={(evento) => {
        mover(escala);
        resto.onPressIn?.(evento);
      }}
      onPressOut={(evento) => {
        mover(1);
        resto.onPressOut?.(evento);
      }}
    >
      <Animated.View style={[estilo, { transform: [{ scale: valor }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center' },
  ecg: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 48 },
});