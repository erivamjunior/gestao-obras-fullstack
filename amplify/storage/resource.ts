import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'documentosObra',
  access: (allow) => ({
    'obras/*': [allow.authenticated.to(['read', 'write', 'delete'])],
  }),
});
