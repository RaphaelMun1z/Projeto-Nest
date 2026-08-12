# Document Service

<div align="center">
  <img src="https://img.shields.io/badge/status-MVP%20funcional-22C55E?style=for-the-badge" alt="Status: MVP funcional">
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 22">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS 11">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose">
</div>

API NestJS para upload, validação, extração e gerenciamento de documentos PDF.
O serviço extrai as seções curriculares, persiste os metadados no PostgreSQL e
publica eventos versionados no Kafka para processamento assíncrono.

> **Versão atual do backend:** `v0.0.1`<br>
> **Estágio:** MVP funcional

## Arquitetura

O serviço segue uma arquitetura modular, com separação entre entrada HTTP,
casos de uso, validação, extração, persistência e mensageria.

### Componentes principais

| Componente                  | Responsabilidade                                         |
| :-------------------------- | :------------------------------------------------------- |
| `DocumentController`        | Expõe os endpoints HTTP de documentos.                   |
| `DocumentService`           | Coordena criação, consulta, atualização e exclusão.      |
| `PdfValidationService`      | Valida presença, tamanho, MIME type e assinatura do PDF. |
| `PdfTextExtractor`          | Extrai, normaliza e organiza o texto do PDF.             |
| `DocumentExtractionService` | Orquestra validação e extração.                          |
| `DocumentOutboxService`     | Persiste documento e evento na mesma transação.          |
| `DocumentEventProducer`     | Publica eventos no Kafka com retry e DLT.                |
| `HealthController`          | Expõe liveness, readiness e health check.                |

### Fluxo de criação

```text
Upload PDF
    ↓
Validação do arquivo
    ↓
Extração e normalização
    ↓
PostgreSQL: documento + evento na Outbox
    ↓
Worker da Outbox
    ↓
Kafka: document.extracted.v1
```

## Portas e serviços

### Infraestrutura local

| Status | Componente     | Porta local | Papel                           |
| :----: | :------------- | :---------: | :------------------------------ |
|   ✅   | API NestJS     |   `3000`    | Endpoints HTTP e health checks. |
|   ✅   | PostgreSQL     |   `5432`    | Documentos, metadados e Outbox. |
|   ✅   | Kafka broker 1 |   `9092`    | Mensageria externa.             |
|   ✅   | Kafka broker 2 |   `9094`    | Mensageria externa e réplica.   |

Internamente, os brokers Kafka utilizam `kafka-1:19092` e `kafka-2:19092`.
Os tópicos possuem três partições e fator de replicação dois.

### Tópicos Kafka

| Tópico                      | Finalidade                                             |
| :-------------------------- | :----------------------------------------------------- |
| `document.extracted.v1`     | Evento publicado após a persistência do documento.     |
| `document.extracted.v1.DLT` | Eventos que falharam após as tentativas de publicação. |

Os eventos usam `documentId` como chave Kafka, preservando a ordem de eventos
do mesmo documento.

## Stack tecnológica

### Backend

- **NestJS:** framework modular da API.
- **TypeScript:** linguagem principal.
- **TypeORM:** persistência e migrations.
- **PostgreSQL:** armazenamento de documentos, seções e eventos da Outbox.
- **Multer:** recebimento de arquivos multipart.
- **LiteParse:** extração de texto dos PDFs.
- **class-validator e class-transformer:** validação e transformação dos DTOs.
- **KafkaJS e NestJS Microservices:** publicação de eventos.
- **NestJS Terminus:** health checks.

### Resiliência

- **Outbox Pattern:** documento e evento são confirmados na mesma transação.
- **Worker concorrente:** cada pod usa `FOR UPDATE SKIP LOCKED` para reivindicar
  eventos sem dois workers processarem a mesma linha ao mesmo tempo; locks
  abandonados expiram após 60 segundos.
- **Retry:** até três tentativas com backoff exponencial para publicação Kafka.
- **DLT:** mensagens que falham definitivamente são encaminhadas para um tópico
  de erro.
- **Idempotência:** `eventId` único no banco e `documentId` como chave Kafka.

### Infraestrutura e qualidade

- **Docker Compose:** PostgreSQL e Kafka locais.
- **Kubernetes:** Deployment, Service, ConfigMap, Secret, probes, HPA e Job de
  migrations.
- **Jest:** testes unitários e E2E.
- **Testcontainers:** testes de integração com PostgreSQL.
- **k6:** testes de carga e documentação de resultados.

## Como executar localmente

### Pré-requisitos

- Node.js 22 ou superior;
- npm;
- Docker com Docker Compose;
- Docker Desktop em execução para os serviços locais.

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o ambiente

Crie o arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Para o Docker Compose local, use:

```env
MAX_PDF_SIZE_BYTES=10485760

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=db-documents

KAFKA_BROKERS=localhost:9092,localhost:9094
KAFKA_CLIENT_ID=document-service
KAFKA_DOCUMENT_TOPIC=document.extracted.v1
```

### 3. Inicie a infraestrutura

```bash
docker compose up -d
```

Execute as migrations:

```bash
npm run migration:run
```

### 4. Inicie a API

Desenvolvimento:

```bash
npm run start:dev
```

Produção:

```bash
npm run build
npm run start:prod
```

A API ficará disponível em `http://localhost:3000`.

## Endpoints

### Health checks

| Método | Caminho         | Descrição                                 |
| :----: | :-------------- | :---------------------------------------- |
| `GET`  | `/health`       | Saúde geral da aplicação e do PostgreSQL. |
| `GET`  | `/health/live`  | Confirma que o processo está ativo.       |
| `GET`  | `/health/ready` | Confirma acesso ao PostgreSQL.            |

### Documentos

|  Método  | Caminho              | Descrição                               |
| :------: | :------------------- | :-------------------------------------- |
|  `POST`  | `/documents/extract` | Extrai um PDF sem persistir.            |
|  `POST`  | `/documents`         | Extrai e cria um documento.             |
|  `GET`   | `/documents`         | Lista documentos com filtros opcionais. |
|  `GET`   | `/documents/:id`     | Busca um documento pelo UUID.           |
| `PATCH`  | `/documents/:id`     | Atualiza parcialmente um documento.     |
| `DELETE` | `/documents/:id`     | Remove um documento.                    |

### Upload

Os endpoints `POST /documents/extract` e `POST /documents` usam
`multipart/form-data`.

Campos:

- `file`: PDF obrigatório;
- `disciplina`: obrigatório em `POST /documents`;
- `universidade`: obrigatório em `POST /documents`;
- `ano_curriculo`: obrigatório em `POST /documents`, entre 1900 e 2100;
- `description`: opcional em `POST /documents`.

Exemplo:

```bash
curl -X POST http://localhost:3000/documents/extract \
  -F "file=@./documento.pdf"
```

### Filtros

```text
GET /documents?fileName=documento&disciplina=Engenharia&universidade=Teste&ano_curriculo=2026
```

Os filtros textuais fazem busca parcial. `ano_curriculo` faz busca exata.

## Testes automatizados

Testes unitários e E2E:

```bash
npm test
npm run test:unit
npm run test:e2e
```

Testes de integração com Docker:

```powershell
$env:RUN_INFRA_TESTS="1"
docker compose up -d database kafka-1 kafka-2 kafka-init
npm run migration:run
npm run test:integration
```

Quando `RUN_INFRA_TESTS` não está definido, os testes de infraestrutura são
ignorados para manter o ciclo local independente do Docker.

## Postman e documentação

- [Collection Postman](postman/projeto-nest.postman_collection.json)
- [Resultados dos testes k6](docs/resultados-testes-k6.md)
- [Gráficos dos testes k6](docs/k6-testes-graficos.html)
- [Guia de Kubernetes](k8s/README.md)

## Kubernetes

Os manifests estão em [k8s/](k8s/) e incluem:

- Deployment com duas réplicas;
- Service interno;
- ConfigMap e Secret de exemplo;
- probes de liveness, readiness e startup;
- HPA baseado em CPU;
- Job para migrations;
- Kustomization.

Consulte o [guia de Kubernetes](k8s/README.md) para construir a imagem, criar
o Secret e aplicar os manifests.

## Comandos disponíveis

| Objetivo                      | Comando                    |
| :---------------------------- | :------------------------- |
| Iniciar em desenvolvimento    | `npm run start:dev`        |
| Compilar                      | `npm run build`            |
| Executar versão compilada     | `npm run start:prod`       |
| Formatar código               | `npm run format`           |
| Verificar lint                | `npm run lint`             |
| Executar todos os testes      | `npm test`                 |
| Executar testes unitários     | `npm run test:unit`        |
| Executar testes E2E           | `npm run test:e2e`         |
| Executar testes de integração | `npm run test:integration` |
| Executar migrations           | `npm run migration:run`    |
| Reverter última migration     | `npm run migration:revert` |
