import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Obra: a
    .model({
      nome: a.string().required(),
      cliente: a.string().required(),
      descricao: a.string(),
      status: a.enum(['PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA']),
      dataInicio: a.date().required(),
      dataPrevistaTermino: a.date(),
      valorContrato: a.float(),
      etapas: a.hasMany('Etapa', 'obraId'),
      documentos: a.hasMany('Documento', 'obraId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['ENGENHEIRO']).to(['create', 'read', 'update']),
      allow.groups(['COLABORADOR']).to(['read']),
    ]),
  Etapa: a
    .model({
      nome: a.string().required(),
      descricao: a.string(),
      status: a.enum(['PENDENTE', 'EM_EXECUCAO', 'CONCLUIDA']),
      progresso: a.integer().default(0),
      obraId: a.id().required(),
      obra: a.belongsTo('Obra', 'obraId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['ENGENHEIRO']).to(['create', 'read', 'update']),
      allow.groups(['COLABORADOR']).to(['read']),
    ]),
  Documento: a
    .model({
      nomeArquivo: a.string().required(),
      caminhoStorage: a.string().required(),
      tipoMime: a.string(),
      tamanhoBytes: a.integer().required(),
      obraId: a.id().required(),
      etapaId: a.id(),
      obra: a.belongsTo('Obra', 'obraId'),
      etapa: a.belongsTo('Etapa', 'etapaId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
      allow.groups(['ENGENHEIRO']).to(['create', 'read', 'update']),
      allow.groups(['COLABORADOR']).to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
