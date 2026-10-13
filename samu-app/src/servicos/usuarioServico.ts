import clienteHttp from './clienteHttp';

export interface UsuarioSistema {
  id: number | null;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  username: string;
  imagemUrl?: string;
  roles?: string[];
  tenantId?: number | null;
  tenantNome?: string | null;
}

export interface Tenant {
  id: number;
  nome: string;
  cidade: string | null;
  estado: string | null;
}

const lista = <T>(dados: unknown): T[] => (Array.isArray(dados) ? (dados as T[]) : []);

export const usuarioServico = {
  async listarTodos(global = false): Promise<UsuarioSistema[]> {
    const rota = global ? '/usuarios/listar-todos-global' : '/usuarios/listar-todos';
    const { data } = await clienteHttp.get(rota);
    return lista<UsuarioSistema>(data);
  },

  async listarPorTenant(tenantId: number): Promise<UsuarioSistema[]> {
    const { data } = await clienteHttp.get(`/usuarios/listar-por-tenant/${tenantId}`);
    return lista<UsuarioSistema>(data);
  },

  async listarPorRole(role: string): Promise<UsuarioSistema[]> {
    const { data } = await clienteHttp.get('/usuarios/roles', { params: { roles: role } });
    return lista<UsuarioSistema>(data);
  },

  async criarUsuarioAdmin(payload: unknown): Promise<void> {
    await clienteHttp.post('/usuarios/criar-usuario-admin', payload);
  },

  async atualizarDados(id: number | string, dados: unknown): Promise<void> {
    await clienteHttp.patch(`/usuarios/atualizar-dados/${id}`, dados);
  },

  async deletar(id: number | string): Promise<void> {
    await clienteHttp.delete(`/usuarios/${id}`);
  },

  async listarTenants(): Promise<Tenant[]> {
    const { data } = await clienteHttp.get('/api/tenants');
    return lista<Tenant>(data);
  },
};