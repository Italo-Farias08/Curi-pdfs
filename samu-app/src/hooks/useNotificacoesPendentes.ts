import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { useSessao } from '../contextos/SessaoContexto';
import { notificacaoServico } from '../servicos/notificacaoServico';
import { INTERVALO_NOTIFICACOES_MS } from '../config/ambiente';
import { momentoAtualBrasilia } from '../utilitarios/dataHora';
import type { Notificacao } from '../tipos/autenticacao';

export function useNotificacoesPendentes() {
  const { usuario } = useSessao();
  const nomeCompleto = usuario?.nomeCompleto;

  const [pendentes, setPendentes] = useState<Notificacao[]>([]);
  const [totalInicial, setTotalInicial] = useState(0);
  const [visivel, setVisivel] = useState(false);
  const [processando, setProcessando] = useState(false);

  const lidasNaRodada = useRef(0);
  const confirmando = useRef(false);

  const buscar = useCallback(async () => {
    if (!nomeCompleto || confirmando.current) return;
    try {
      const lista = await notificacaoServico.listarPendentesPorDestinatario<Notificacao>(
        nomeCompleto,
      );
      if (confirmando.current) return;

      const manuais = lista.filter((notificacao) => !notificacao.tipoEvento);
      setPendentes(manuais);
      setTotalInicial(lidasNaRodada.current + manuais.length);
      if (manuais.length > 0) {
        setVisivel(true);
      } else {
        lidasNaRodada.current = 0;
        setVisivel(false);
      }
    } catch {
    }
  }, [nomeCompleto]);

  const confirmarLeitura = useCallback(
    async (id: number) => {
      confirmando.current = true;
      setProcessando(true);
      try {
        await notificacaoServico.receber(id, momentoAtualBrasilia());
        lidasNaRodada.current += 1;
        setPendentes((anteriores) => anteriores.filter((notificacao) => notificacao.id !== id));
      } catch {
        Alert.alert('Erro', 'Erro ao marcar notificação');
      } finally {
        confirmando.current = false;
        setProcessando(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (visivel && pendentes.length === 0) {
      lidasNaRodada.current = 0;
      setTotalInicial(0);
      setVisivel(false);
    }
  }, [pendentes, visivel]);

  useEffect(() => {
    if (!nomeCompleto) return;

    buscar();
    const intervalo = setInterval(buscar, INTERVALO_NOTIFICACOES_MS);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') buscar();
    });

    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, [nomeCompleto, buscar]);

  return { visivel, pendentes, totalInicial, processando, confirmarLeitura };
}
