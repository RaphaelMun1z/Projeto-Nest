# Comandos úteis do NestJS

Guia rápido dos principais comandos do [NestJS CLI](https://docs.nestjs.com/cli/overview) para criar, desenvolver e manter uma aplicação NestJS.

## Instalação e criação de projetos

| Objetivo | Comando | Descrição |
|---|---|---|
| Instalar o Nest CLI globalmente | `npm i -g @nestjs/cli` | Instala a interface de linha de comando do NestJS. |
| Ver a versão do Nest CLI | `nest --version` | Exibe a versão instalada do CLI. |
| Criar um novo projeto | `nest new nome-do-projeto` | Cria uma aplicação NestJS do zero. |
| Criar usando npm | `nest new nome-do-projeto --package-manager npm` | Define o npm como gerenciador de pacotes. |
| Criar usando pnpm | `nest new nome-do-projeto --package-manager pnpm` | Define o pnpm como gerenciador de pacotes. |
| Listar opções do CLI | `nest --help` | Mostra todos os comandos e opções disponíveis. |

## Executar e compilar o projeto

Execute os comandos a partir da pasta raiz do projeto.

| Objetivo | Comando | Descrição |
|---|---|---|
| Instalar dependências | `npm install` | Instala as dependências do projeto. |
| Iniciar a aplicação | `npm run start` | Executa a aplicação normalmente. |
| Iniciar em modo desenvolvimento | `npm run start:dev` | Executa com *watch* e reinicia após alterações. |
| Iniciar com depuração | `npm run start:debug` | Executa com suporte ao debugger. |
| Compilar o projeto | `npm run build` | Gera a versão compilada na pasta `dist`. |
| Executar a versão compilada | `npm run start:prod` | Inicia a aplicação usando `dist/main`. |

Também é possível executar diretamente pelo CLI:

```bash
nest start
nest start --watch
nest start --debug --watch
```

## Gerar arquivos e recursos

O formato abreviado `nest g` significa `nest generate`. O caminho pode ser alterado conforme a organização do projeto.

| Objetivo | Comando | Arquivos gerados |
|---|---|---|
| Gerar um módulo | `nest g module users` | `users/users.module.ts` |
| Gerar um controller | `nest g controller users` | Controller e arquivo de teste. |
| Gerar um service/provider | `nest g service users` | Service e arquivo de teste. |
| Gerar uma classe | `nest g class users/dto/create-user.dto` | Classe TypeScript. |
| Gerar uma interface | `nest g interface users/interfaces/user` | Interface TypeScript. |
| Gerar um recurso completo | `nest g resource users` | Módulo, controller, service, DTOs e testes. |
| Gerar um CRUD completo | `nest g resource users --no-spec` | Recurso CRUD sem arquivos de teste. |
| Gerar um guard | `nest g guard auth/guards/auth` | Guard para autorização/autenticação. |
| Gerar um interceptor | `nest g interceptor common/logging` | Interceptor para modificar o fluxo de requisições. |
| Gerar um pipe | `nest g pipe common/pipes/validation` | Pipe para transformação ou validação. |
| Gerar um middleware | `nest g middleware common/middleware/logger` | Middleware para processar requisições. |
| Gerar um filtro de exceção | `nest g filter common/filters/http-exception` | Filtro para tratar exceções. |
| Gerar um decorator | `nest g decorator common/decorators/user` | Decorator customizado. |
| Não gerar testes | `nest g controller users --no-spec` | Cria o arquivo principal sem o `.spec.ts`. |
| Ver arquivos sem criá-los | `nest g service users --dry-run` | Simula a geração e lista os arquivos. |

Exemplo de criação de um módulo com controller e service:

```bash
nest g module users
nest g controller users
nest g service users
```

## Qualidade, testes e formatação

| Objetivo | Comando | Descrição |
|---|---|---|
| Formatar o código | `npm run format` | Formata arquivos TypeScript com Prettier. |
| Verificar e corrigir lint | `npm run lint` | Executa o ESLint e aplica correções disponíveis. |
| Executar testes | `npm test` | Executa os testes unitários. |
| Executar testes observando alterações | `npm run test:watch` | Mantém os testes em execução no modo watch. |
| Gerar relatório de cobertura | `npm run test:cov` | Executa os testes e gera cobertura de código. |
| Executar testes end-to-end | `npm run test:e2e` | Executa os testes de integração da aplicação. |

## Comandos úteis do npm

| Objetivo | Comando | Descrição |
|---|---|---|
| Adicionar uma dependência | `npm i nome-do-pacote` | Instala uma dependência de produção. |
| Adicionar uma dependência de desenvolvimento | `npm i -D nome-do-pacote` | Instala uma dependência apenas para desenvolvimento. |
| Remover uma dependência | `npm uninstall nome-do-pacote` | Remove o pacote do projeto. |
| Atualizar dependências | `npm update` | Atualiza pacotes conforme as regras do `package.json`. |

> Dica: use `nest g <comando> --help` para consultar as opções específicas de cada gerador. Por exemplo: `nest g resource --help`.
