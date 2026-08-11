## Sumário

- [Endpoints](#endpoints)
- [Comandos](#comandos)

## Endpoints

> 🔒 Endpoint protegido: exige o header `Authorization: Bearer <token>`.

<details>
<summary>auth</summary>

| Método | Caminho | Objetivo | Exemplo |
|---|---|---|---|
| POST | `/auth/login` | Autenticar usuário e gerar token JWT. | `{"username":"usuario.exemplo","password":"senha-segura"}` |

</details>

<details>
<summary>users</summary>

| Método | Caminho | Objetivo | Exemplo |
|---|---|---|---|
| POST | `/users` | Criar usuário. | `{"username":"novo.usuario","password":"senha-segura"}` |

</details>

<details>
<summary>documents</summary>

| Método | Caminho | Objetivo | Exemplo |
|---|---|---|---|
| POST | 🔒 `/documents/extract` | Receber e extrair o conteúdo de um PDF. | `multipart/form-data: file=documento.pdf` |
| POST | 🔒 `/documents` | Criar registro de documento. | `{"originalName":"documento.pdf","mimeType":"application/pdf","sizeBytes":245760,"hash":"aaaaaaaa...","storageKey":"documents/id/documento.pdf"}` |
| GET | 🔒 `/documents` | Listar documentos com filtros opcionais. | `?originalName=documento.pdf&status=COMPLETED` |
| GET | 🔒 `/documents/:id` | Buscar documento pelo ID. | `{"id":"550e8400-e29b-41d4-a716-446655440000"}` |
| PATCH | 🔒 `/documents/:id` | Atualizar parcialmente um documento. | `{"status":"COMPLETED","extractedTextRef":"extracted-text/id.txt"}` |
| DELETE | 🔒 `/documents/:id` | Remover documento pelo ID. | `{"id":"550e8400-e29b-41d4-a716-446655440000"}` |

</details>

## Comandos

| Objetivo | Comando |
|---|---|
| Instalar o Nest CLI globalmente | `npm i -g @nestjs/cli` |
| Criar um novo projeto | `nest new nome-do-projeto` |


Execute os comandos a partir da pasta raiz do projeto.

| Objetivo | Comando |
|---|---|
| Instalar dependências | `npm install` |
| Iniciar a aplicação | `npm run start` |
| Iniciar em modo desenvolvimento | `npm run start:dev` |
| Iniciar com depuração | `npm run start:debug` |
| Compilar o projeto | `npm run build` |
| Executar a versão compilada | `npm run start:prod` |



O formato abreviado `nest g` significa `nest generate`. O caminho pode ser alterado conforme a organização do projeto.

| Objetivo | Comando |
|---|---|
| Gerar um módulo | `nest g module users` |
| Gerar um controller | `nest g controller users` |
| Gerar um service/provider | `nest g service users` |
| Gerar uma classe | `nest g class users/dto/create-user.dto` |
| Gerar uma interface | `nest g interface users/interfaces/user` |
| Gerar um recurso completo | `nest g resource users` |
| Gerar um CRUD completo | `nest g resource users --no-spec` |
| Gerar um guard | `nest g guard auth/guards/auth` |
| Gerar um interceptor | `nest g interceptor common/logging` |
| Gerar um pipe | `nest g pipe common/pipes/validation` |
| Gerar um middleware | `nest g middleware common/middleware/logger` |
| Gerar um filtro de exceção | `nest g filter common/filters/http-exception` |
| Gerar um decorator | `nest g decorator common/decorators/user` |
| Não gerar testes | `nest g controller users --no-spec` |
| Ver arquivos sem criá-los | `nest g service users --dry-run` |



| Objetivo | Comando |
|---|---|
| Formatar o código | `npm run format` |
| Verificar e corrigir lint | `npm run lint` |
| Executar testes | `npm test` |
| Executar testes observando alterações | `npm run test:watch` |
| Gerar relatório de cobertura | `npm run test:cov` |
| Executar testes end-to-end | `npm run test:e2e` |


| Objetivo | Comando |
|---|---|
| Adicionar uma dependência | `npm i nome-do-pacote` |
| Adicionar uma dependência de desenvolvimento | `npm i -D nome-do-pacote` |
| Remover uma dependência | `npm uninstall nome-do-pacote` |
| Atualizar dependências | `npm update` |


