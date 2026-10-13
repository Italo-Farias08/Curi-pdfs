const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export interface CargaJwt {
  sub: string;
  roles: string[];
  tenantId: number | null;
  iat: number;
  exp: number;
}

const CARGA_VAZIA: CargaJwt = { sub: '', roles: [], tenantId: null, iat: 0, exp: 0 };

function decodificarBase64Url(entrada: string): string {
  const texto = entrada.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let bits = 0;
  let acumulador = 0;
  let saida = '';

  for (let i = 0; i < texto.length; i++) {
    const indice = ALFABETO.indexOf(texto.charAt(i));
    if (indice < 0) continue;
    acumulador = (acumulador << 6) | indice;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      const byte = (acumulador >> bits) & 0xff;
      saida += '%' + byte.toString(16).padStart(2, '0');
      acumulador &= (1 << bits) - 1;
    }
  }

  return decodeURIComponent(saida);
}

export function decodificarToken(token: string): CargaJwt {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) throw new Error('Token inválido');
    return JSON.parse(decodificarBase64Url(partes[1])) as CargaJwt;
  } catch {
    return CARGA_VAZIA;
  }
}

export function tokenExpirado(token?: string | null): boolean {
  if (!token) return true;
  const carga = decodificarToken(token);
  if (!carga.exp) return true;
  return carga.exp < Math.floor(Date.now() / 1000);
}
