# Gestão de Obras Fullstack (AWS Amplify Gen 2)

Sistema fullstack real para gestão de obras, pronto para AWS Amplify Hosting Fullstack com provisionamento automático de backend.

## Stack

- **Frontend:** Next.js 14 + React + AWS Amplify UI
- **Backend:** AWS Amplify Gen 2 (`amplify/`)
- **Auth:** Amazon Cognito (email/senha)
- **Dados:** Amazon DynamoDB via Amplify Data
- **Arquivos:** Amazon S3 via Amplify Storage

## Funcionalidades implementadas

- Login e sessão real com Cognito.
- Controle de permissões por grupos (`ADMIN`, `ENGENHEIRO`, `COLABORADOR`).
- CRUD real de obras persistido na AWS.
- Upload e download real de documentos no S3.
- Metadados dos documentos persistidos no banco.
- Estrutura pronta para deploy no Amplify Console com backend fullstack.

## Estrutura

```bash
amplify/
  auth/resource.ts
  data/resource.ts
  storage/resource.ts
  backend.ts
src/
  app/
  lib/
```

## Deploy no AWS Amplify Console

1. Conecte este repositório no **AWS Amplify Console**.
2. Selecione o app como **Fullstack**.
3. O Amplify detectará a pasta `amplify/` e provisionará backend automaticamente.
4. Após o primeiro build, o arquivo `amplify_outputs.json` será gerado no ambiente e usado pelo frontend.

## Execução local

```bash
npm install
npm run dev
```

Para ambiente local com backend real, use o fluxo padrão do Amplify Gen 2 (sandbox/deploy) para gerar `amplify_outputs.json` apontando para sua conta AWS.

## Observações de segurança e autorização

- O backend está configurado para:
  - `ADMIN`: CRUD completo
  - `ENGENHEIRO`: criar/ler/editar
  - `COLABORADOR`: leitura
- Usuários sem grupo continuam autenticados, mas com restrições funcionais.

