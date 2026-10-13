import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { UsuarioAutenticado } from '../tipos/autenticacao';
import {
  entrar as entrarServico,
  restaurarSessao,
  sair as sairServico,
} from '../servicos/autenticacaoServico';
import { ouvirEvento } from '../utilitarios/eventosSessao';

type Situacao = 'carregando' | 'autenticado' | 'anonimo';

interface ValorSessao {
  situacao: Situacao;
  usuario: UsuarioAutenticado | null;
  unidadeSuspensa: boolean;
  entrar: (username: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const SessaoContexto = createContext<ValorSessao | null>(null);

export function SessaoProvedor({ children }: { children: React.ReactNode }) {
  const [situacao, setSituacao] = useState<Situacao>('carregando');
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [unidadeSuspensa, setUnidadeSuspensa] = useState(false);

  useEffect(() => {
    let ativo = true;
    restaurarSessao().then((restaurado) => {
      if (!ativo) return;
      setUsuario(restaurado);
      setSituacao(restaurado ? 'autenticado' : 'anonimo');
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const removerEncerrada = ouvirEvento('sessao-encerrada', () => {
      setUsuario(null);
      setUnidadeSuspensa(false);
      setSituacao('anonimo');
    });
    const removerSuspensa = ouvirEvento('unidade-suspensa', () => {
      setUnidadeSuspensa(true);
    });
    return () => {
      removerEncerrada();
      removerSuspensa();
    };
  }, []);

  const entrar = useCallback(async (username: string, senha: string) => {
    const autenticado = await entrarServico(username, senha);
    setUnidadeSuspensa(false);
    setUsuario(autenticado);
    setSituacao('autenticado');
  }, []);

  const sair = useCallback(async () => {
    await sairServico();
    setUsuario(null);
    setUnidadeSuspensa(false);
    setSituacao('anonimo');
  }, []);

  const valor = useMemo(
    () => ({ situacao, usuario, unidadeSuspensa, entrar, sair }),
    [situacao, usuario, unidadeSuspensa, entrar, sair],
  );

  return <SessaoContexto.Provider value={valor}>{children}</SessaoContexto.Provider>;
}

export function useSessao(): ValorSessao {
  const contexto = useContext(SessaoContexto);
  if (!contexto) throw new Error('useSessao deve ser usado dentro de SessaoProvedor');
  return contexto;
}
