# Projeto NestJS — API de Documentos

API NestJS para extração, criação e gerenciamento de documentos PDF.

## Pré-requisitos

- Node.js e npm
- Docker e Docker Compose

## Configuração

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

Para usar o banco fornecido pelo Docker Compose, confira se o `.env` contém:

```env
MAX_PDF_SIZE_BYTES=10485760

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=db-documents
```

## Banco de dados

Inicie o PostgreSQL:

```bash
docker compose up -d
```

Execute as migrations:

```bash
npm run migration:run
```

Para limpar completamente o banco e recriá-lo:

```bash
docker compose down -v
docker compose up -d
npm run migration:run
```

O comando `docker compose down -v` remove o volume e apaga todos os dados do banco.

## Executando a aplicação

Desenvolvimento:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

Produção:

```bash
npm run build
npm run start:prod
```

## Endpoints

| Método | Caminho | Descrição |
|---|---|---|
| POST | `/documents/extract` | Extrai o conteúdo de um PDF sem salvar um documento. |
| POST | `/documents` | Extrai o PDF e cria um documento. |
| GET | `/documents` | Lista documentos. Aceita os filtros opcionais `fileName` e `status`. |
| GET | `/documents/:id` | Busca um documento pelo UUID. |
| PATCH | `/documents/:id` | Atualiza parcialmente um documento. |
| DELETE | `/documents/:id` | Remove um documento. |

### Extrair ou criar documento

Os endpoints `POST /documents/extract` e `POST /documents` usam `multipart/form-data`:

- `file`: arquivo PDF obrigatório
- `description`: descrição opcional, usada somente em `POST /documents`

Exemplo com cURL:

```bash
curl -X POST http://localhost:3000/documents/extract \
  -F "file=@./documento.pdf"
```

### Listar documentos com filtros

```text
GET /documents?fileName=documento&status=COMPLETED
```

Os status aceitos são `PENDING`, `PROCESSING`, `COMPLETED` e `FAILED`.

### Atualizar documento

```json
{
  "status": "COMPLETED",
  "description": "Documento processado"
}
```

## Postman

A collection completa está disponível em:

`postman/projeto-nest.postman_collection.json`

## Comandos disponíveis

| Objetivo | Comando |
|---|---|
| Iniciar normalmente | `npm run start` |
| Iniciar em desenvolvimento | `npm run start:dev` |
| Iniciar com depuração | `npm run start:debug` |
| Compilar | `npm run build` |
| Executar versão compilada | `npm run start:prod` |
| Formatar código | `npm run format` |
| Verificar e corrigir lint | `npm run lint` |
| Executar testes | `npm test` |
| Executar testes end-to-end | `npm run test:e2e` |
| Criar migration | `npm run migration:create --name=nome-da-migration` |
| Executar migrations | `npm run migration:run` |
| Reverter última migration | `npm run migration:revert` |