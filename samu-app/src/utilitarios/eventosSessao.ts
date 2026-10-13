export type EventoSessao = 'sessao-encerrada' | 'unidade-suspensa';

const ouvintes: Record<EventoSessao, Set<() => void>> = {
  'sessao-encerrada': new Set(),
  'unidade-suspensa': new Set(),
};

export function ouvirEvento(evento: EventoSessao, funcao: () => void): () => void {
  ouvintes[evento].add(funcao);
  return () => {
    ouvintes[evento].delete(funcao);
  };
}

export function emitirEvento(evento: EventoSessao): void {
  ouvintes[evento].forEach((funcao) => funcao());
}
