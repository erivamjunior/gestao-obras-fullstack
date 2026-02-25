import { fetchAuthSession } from 'aws-amplify/auth';

export type Papel = 'ADMIN' | 'ENGENHEIRO' | 'COLABORADOR' | 'SEM_GRUPO';

export async function obterPapelUsuario(): Promise<Papel> {
  const session = await fetchAuthSession();
  const groups = session.tokens?.accessToken.payload['cognito:groups'];

  if (!groups || !Array.isArray(groups) || groups.length === 0) {
    return 'SEM_GRUPO';
  }

  if (groups.includes('ADMIN')) return 'ADMIN';
  if (groups.includes('ENGENHEIRO')) return 'ENGENHEIRO';
  if (groups.includes('COLABORADOR')) return 'COLABORADOR';

  return 'SEM_GRUPO';
}

export const podeEditar = (papel: Papel) => papel === 'ADMIN' || papel === 'ENGENHEIRO';
export const podeExcluir = (papel: Papel) => papel === 'ADMIN';
