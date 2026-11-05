# PulseGrid

API HTTP para gerenciamento de dispositivos, construída com TypeScript, Fastify e PostgreSQL. O acesso ao banco usa o Prisma ORM 8 e seu contrato em `prisma/contract.prisma`.

## Requisitos

- Node.js 24 ou compatível com as dependências do projeto
- PostgreSQL 15 ou superior
- npm

## Configuração local

Instale as dependências:

```bash
npm ci
```

Copie `.env.example` para `.env` e configure `DATABASE_URL` para seu banco de desenvolvimento. Por exemplo:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pulsegrid"
```

O banco indicado nessa variável deve existir antes de aplicar as migrations.

## Banco de dados e migrations

O contrato Prisma está em `prisma/contract.prisma`; as migrations revisadas ficam em `migrations/app/`.

Para aplicar ao banco definido por `DATABASE_URL`:

```bash
npm run migrate:latest
```

Esse comando executa `prisma db migrate` e aplica as migrations pendentes do histórico. Ele não cria uma migration nova nem avança a referência `db` usada pelo planejador. Para uma mudança formal no contrato, emita os artefatos, confira o histórico e planeje a partir do último nó já versionado:

```bash
npm run contract:emit
npx prisma migration list
npx prisma migration plan --from <ultimo-no-do-historico> --name descricao_da_alteracao
npx prisma migration show <nova-migration>
npm run migrate:latest
```

Use como `<ultimo-no-do-historico>` o identificador da migration mais recente exibido por `migration list`; `<nova-migration>` é o diretório criado pelo comando de planejamento. Revise a migration antes de aplicá-la. Não use comandos Prisma 7 como `prisma migrate dev` ou `prisma migrate deploy` neste projeto.

## Executar a API

```bash
npm run dev
```

O servidor usa a porta `3000` por padrão. Para compilar e iniciar a versão de produção:

```bash
npm run build
npm start
```

## Health checks

A API expõe três endpoints para monitoramento:

| Endpoint | Resposta saudável | Comportamento |
| --- | --- | --- |
| `GET /health` | `200` — `{"status":"ok"}` | Verifica se a API responde; não consulta o banco. |
| `GET /live` | `200` — `{"status":"alive"}` | Indica que o processo está ativo. |
| `GET /ready` | `200` — `{"status":"ready"}` | Consulta o banco e verifica se a aplicação aceita tráfego. Retorna `503` — `{"status":"not_ready"}` se o banco falhar ou a aplicação estiver encerrando. |

Os testes automatizados desses endpoints ficam em `tests/health.spec.ts`. Eles simulam o health check do banco, sem exigir uma conexão PostgreSQL:

```bash
npm test -- tests/health.spec.ts
```

## Testes

Os comandos padrão rodam testes unitários e HTTP sem acessar o PostgreSQL:

```bash
npm test
npm run test:watch
npm run test:coverage
```

Os testes de integração usam o banco apontado por `DATABASE_URL`. Localmente, crie um banco separado para os testes e configure a conexão em `.env.test`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pulsegrid_test"
```

O arquivo `.env.test` é ignorado pelo Git e não deve conter credenciais compartilhadas. Para preparar o banco de teste, aplique as migrations explicitamente a ele:

```bash
npx prisma db migrate --db "postgresql://user:password@localhost:5432/pulsegrid_test"
npm run test:integration
```

A configuração de integração carrega `.env.test` antes de importar o client Prisma. Ela falha se o arquivo estiver ausente e não houver `DATABASE_URL` no ambiente. Os testes criam registros com IDs próprios e removem apenas esses registros ao terminar.

## CI

O workflow em `.github/workflows/ci.yml` inicia um PostgreSQL 15 descartável, instala dependências, roda lint, typecheck e testes unitários, aplica as migrations com `npm run migrate:latest`, executa os testes de integração e então compila o projeto. Na CI, `DATABASE_URL` vem do próprio workflow; não é necessário versionar `.env.test`.

## Scripts úteis

| Comando | Uso |
| --- | --- |
| `npm run lint` | Verifica o estilo e problemas estáticos |
| `npm run typecheck` | Verifica os tipos TypeScript |
| `npm test` | Executa testes unitários e HTTP |
| `npm run test:integration` | Executa os testes contra PostgreSQL |
| `npm run test:coverage` | Executa cobertura dos testes não integrados |
| `npm run migrate:latest` | Aplica migrations no `DATABASE_URL` configurado |
| `npm run contract:emit` | Atualiza os artefatos a partir do contrato Prisma |
| `npm run build` | Compila para `dist/` |
| `npm run security:audit` | Audita dependências de produção |
