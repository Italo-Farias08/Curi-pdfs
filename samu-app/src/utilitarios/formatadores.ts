export function formatarCpf(valor?: string | null): string {
  if (!valor) return '';
  const limpo = valor.replace(/\D/g, '').slice(0, 11);
  return limpo
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatarDataIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function mensagemDeErro(falha: unknown, padrao: string): string {
  const dados = (falha as { response?: { data?: unknown } })?.response?.data;
  if (typeof dados === 'string' && dados) return dados;
  const msg = (dados as { message?: unknown; error?: unknown } | undefined);
  if (typeof msg?.message === 'string' && msg.message) return msg.message;
  if (typeof msg?.error === 'string' && msg.error) return msg.error;
  return padrao;
}