# Vida+

Aplicativo multiplataforma para cadastro, organização e acompanhamento da validade de medicamentos, com armazenamento local e sincronização opcional em nuvem.

## Contexto acadêmico

O Vida+ foi desenvolvido como trabalho do 6º semestre do curso de Engenharia de Software do Centro Universitário Municipal de Franca (Uni-FACEF), para a disciplina **Desenvolvimento de Software para Web II**.

O projeto aplica conceitos de desenvolvimento web e mobile, persistência de dados, integração entre frontend e backend, funcionamento offline, autenticação, segurança em nível de linha e sincronização de informações.

## Objetivo

O objetivo do Vida+ é ajudar usuários a manter um registro organizado dos medicamentos que possuem e acompanhar suas respectivas datas de validade. O aplicativo classifica automaticamente cada medicamento como válido, próximo do vencimento ou vencido.

Além do controle de validade, o sistema permite registrar informações semelhantes às encontradas em uma bula, como indicação, contraindicações, posologia, efeitos adversos e precauções. Esses dados são informativos e não substituem a bula oficial, a orientação médica ou a avaliação de outro profissional de saúde.

## Funcionalidades

- Cadastro de medicamentos;
- edição e exclusão de registros;
- validação de datas no formato `DD/MM/AAAA`;
- classificação automática da validade;
- busca por nome ou laboratório;
- filtros por situação do medicamento;
- visualização detalhada das informações cadastradas;
- consulta organizada das informações de bula;
- armazenamento offline com SQLite;
- sincronização bidirecional com Supabase;
- sincronização de inclusões, alterações e exclusões;
- isolamento dos dados por usuário com Row Level Security (RLS);
- autenticação anônima persistente;
- suporte a Android, iOS e web;
- estados de carregamento, erro e registro não encontrado;
- recursos básicos de acessibilidade;
- testes automatizados das regras de validade.

## Tecnologias

- React 19;
- React Native;
- Expo SDK 54;
- Expo Router;
- TypeScript;
- Expo SQLite;
- Supabase;
- PostgreSQL;
- AsyncStorage;
- Jest e Jest Expo.

## Arquitetura

O aplicativo utiliza uma estratégia offline-first. O SQLite é a fonte de dados utilizada diretamente pelas telas, permitindo que as operações principais continuem funcionando sem conexão com a internet ou sem configuração do Supabase.

Quando o Supabase está configurado, o aplicativo:

1. autentica o dispositivo anonimamente;
2. envia registros locais ainda não sincronizados;
3. envia exclusões pendentes;
4. recupera os registros pertencentes ao usuário autenticado;
5. atualiza o banco SQLite local sem sobrescrever alterações locais pendentes.

Cada medicamento possui um `sync_id`, gerado no dispositivo, que permanece estável entre o banco local e o PostgreSQL. Esse campo é utilizado pelo `upsert` para impedir a criação de registros duplicados.

```text
Telas e componentes Expo Router
             │
             ▼
     Camada de acesso local
             │
             ▼
        SQLite no dispositivo
             │
             ▼
       Serviço de sincronização
             │
             ▼
 Supabase Auth + API + PostgreSQL
```

## Estrutura do projeto

```text
VidaMais-frontend/
├── app/
│   ├── _layout.tsx                 # Inicialização e navegação principal
│   ├── index.tsx                   # Tela inicial e resumo de validades
│   ├── bula/[id].tsx               # Informações de bula
│   └── medicamentos/
│       ├── index.tsx               # Listagem, busca e filtros
│       ├── novo.tsx                # Cadastro e edição
│       └── [id].tsx                # Detalhes e exclusão
├── src/
│   ├── components/                 # Componentes visuais reutilizáveis
│   ├── constants/                  # Tema e cores
│   ├── database/                   # Persistência e migrações SQLite
│   ├── hooks/                      # Hooks de acesso aos medicamentos
│   ├── services/                   # Cliente Supabase e sincronização
│   └── types/                      # Tipos, regras de validade e testes
├── supabase/
│   └── schema.sql                  # Estrutura e políticas do PostgreSQL
├── app.json                        # Configuração do Expo
├── metro.config.js                 # Suporte ao SQLite/WASM na web
├── package.json                    # Dependências e comandos
└── tsconfig.json                   # Configuração do TypeScript
```

## Requisitos

- Node.js 20 ou superior;
- npm;
- Expo Go, emulador Android, simulador iOS ou navegador moderno;
- projeto no Supabase, caso a sincronização em nuvem seja utilizada.

## Instalação do frontend

Clone o repositório e acesse sua pasta:

```bash
git clone <URL_DO_REPOSITORIO>
cd VidaMais-frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo local de variáveis de ambiente com base no exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell, utilize:

```powershell
Copy-Item .env.example .env
```

Preencha o arquivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_OU_PUBLISHABLE
```

Nunca coloque a chave `service_role` no frontend. Variáveis com o prefixo `EXPO_PUBLIC_` são incluídas no aplicativo e podem ser lidas pelo usuário final. A segurança deve ser garantida pelas políticas RLS, e não pelo sigilo da chave pública.

## Execução

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Outros comandos disponíveis:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
npm test
```

O projeto pode ser usado sem Supabase. Nesse caso, os dados permanecem somente no SQLite do dispositivo e a sincronização fica pendente.

## Orientações para a equipe de backend

O backend atual é baseado nos serviços gerenciados do Supabase. Não é necessário criar inicialmente uma API REST separada: o cliente oficial do Supabase utiliza a API gerada automaticamente a partir do PostgreSQL, protegida por autenticação e RLS.

### 1. Criar o projeto no Supabase

1. Acesse o painel do Supabase e crie uma organização, caso ainda não exista.
2. Selecione **New project**.
3. Defina um nome para o projeto, uma senha forte para o banco e a região mais próxima dos usuários.
4. Aguarde a criação e inicialização do PostgreSQL.
5. Armazene a senha do banco em um gerenciador de segredos. Ela não deve ser enviada ao frontend.

Recomenda-se criar projetos separados para desenvolvimento, homologação e produção. Cada ambiente deverá possuir URL, chaves e banco próprios.

### 2. Habilitar autenticação anônima

O frontend chama `signInAnonymously()` quando encontra uma configuração válida do Supabase. Portanto, a equipe de backend deve habilitar o provedor anônimo:

1. Abra **Authentication** no painel do projeto.
2. Acesse a área de provedores ou métodos de login.
3. Localize **Anonymous Sign-Ins**.
4. Habilite a opção de autenticação anônima.
5. Salve a configuração.

O Supabase passa a emitir uma sessão autenticada para cada instalação. Essa sessão é persistida no dispositivo por meio do AsyncStorage. Mesmo sendo anônimo, o usuário recebe um UUID em `auth.users`, utilizado pelas políticas RLS.

Para uma versão futura com login convencional, a conta anônima deverá ser vinculada a um provedor permanente antes da troca de sessão, preservando o mesmo usuário e seus registros.

### 3. Criar o banco e as políticas

1. Abra **SQL Editor** no Supabase.
2. Crie uma nova consulta.
3. Copie todo o conteúdo de `supabase/schema.sql`.
4. Execute o script.
5. Confirme no **Table Editor** a criação da tabela `public.medicamentos`.

O script pode ser executado novamente para atualizar uma instalação anterior. Ele cria as colunas necessárias, remove as antigas políticas públicas e recria as políticas vinculadas a `auth.uid()`.

Em bancos que já tenham dados da versão anterior, registros sem `user_id` não ficarão visíveis para usuários autenticados. A equipe de backend deverá decidir a propriedade desses dados e preenchê-la por uma migração administrativa. Não atribua registros automaticamente a um usuário sem validar sua origem.

### 4. Contrato da tabela `medicamentos`

| Campo | Tipo PostgreSQL | Obrigatório | Responsabilidade |
|---|---|---:|---|
| `id` | `bigint` | Sim | Chave primária interna do Supabase |
| `sync_id` | `text` | Sim | Identificador único gerado pelo frontend |
| `user_id` | `uuid` | Sim | Proprietário, relacionado a `auth.users` |
| `nome` | `text` | Sim | Nome do medicamento |
| `laboratorio` | `text` | Sim | Laboratório ou string vazia |
| `validade` | `date` | Sim | Data no formato ISO `AAAA-MM-DD` |
| `indicacao` | `text` | Sim | Indicação ou string vazia |
| `contraindicacoes` | `text` | Sim | Contraindicações ou string vazia |
| `posologia` | `text` | Sim | Posologia ou string vazia |
| `efeitos_adversos` | `text` | Sim | Efeitos adversos ou string vazia |
| `precaucoes` | `text` | Sim | Precauções ou string vazia |
| `observacoes` | `text` | Sim | Observações ou string vazia |
| `created_at` | `timestamptz` | Sim | Data de criação em UTC |
| `updated_at` | `timestamptz` | Sim | Data da última alteração em UTC |

O `id` local do SQLite não deve ser utilizado como identificador remoto, pois dispositivos diferentes podem produzir o mesmo número. Toda correspondência entre os bancos deve utilizar `sync_id`.

### 5. Segurança e Row Level Security

A tabela deve permanecer com RLS habilitado. As quatro políticas presentes no script permitem que usuários autenticados:

- consultem somente linhas cujo `user_id` seja igual a `auth.uid()`;
- incluam somente linhas associadas ao próprio usuário;
- alterem somente os próprios registros;
- excluam somente os próprios registros.

Não substitua essas condições por `using (true)` ou `with check (true)` em produção. Isso permitiria que qualquer cliente com a chave pública acessasse todos os medicamentos cadastrados.

A chave `service_role` ignora as políticas RLS. Ela deve existir apenas em ambientes seguros de backend, scripts administrativos ou funções server-side e nunca deve ser entregue à aplicação Expo.

### 6. Obter as credenciais públicas

No painel do Supabase:

1. Abra as configurações de API do projeto.
2. Copie a **Project URL**.
3. Copie a chave pública `anon` ou `publishable`, conforme a nomenclatura exibida pelo painel.
4. Entregue esses valores à equipe de frontend por um canal seguro.
5. A equipe de frontend deverá armazená-los somente no `.env` local ou no gerenciador de variáveis do ambiente de build.

Mapeamento esperado:

```env
EXPO_PUBLIC_SUPABASE_URL=<Project URL>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon ou publishable key>
```

### 7. Validar a integração

Depois que frontend e backend estiverem configurados:

1. Inicie o aplicativo com um `.env` válido.
2. Cadastre um medicamento.
3. Verifique no Table Editor se foi criada uma linha com `sync_id` e `user_id`.
4. Edite o medicamento e confirme que a mesma linha foi atualizada, sem duplicação.
5. Exclua o medicamento e confirme que a linha remota foi removida.
6. Reinicie o aplicativo e confirme que a sessão anônima foi preservada.
7. Teste sem internet, faça alterações locais e restaure a conexão para validar o envio dos itens pendentes.
8. Crie uma segunda sessão ou instalação e confirme que ela não consegue consultar os dados da primeira.

As requisições podem ser acompanhadas pelos logs do Supabase e pelas ferramentas de desenvolvimento do aplicativo.

### 8. Responsabilidades de cada camada

Frontend:

- validar entradas do usuário;
- gerar e preservar o `sync_id`;
- persistir dados no SQLite;
- registrar alterações e exclusões pendentes;
- obter e persistir a sessão de autenticação;
- executar o envio e recebimento durante a sincronização;
- apresentar ao usuário falhas de sincronização sem perder o dado local.

Backend/Supabase:

- manter a estrutura e as restrições do PostgreSQL;
- autenticar usuários e emitir sessões válidas;
- aplicar RLS em todas as operações;
- manter backups e ambientes separados;
- monitorar erros, desempenho e tentativas de acesso negadas;
- planejar migrações de banco versionadas;
- proteger credenciais administrativas.

### 9. Evolução para um backend próprio

Caso a equipe decida introduzir uma API própria no futuro, ela deverá preservar o contrato de dados e o comportamento offline do aplicativo. Recomenda-se:

- utilizar HTTPS em todos os ambientes;
- validar o JWT emitido pelo Supabase ou adotar um provedor de identidade definido pela equipe;
- obter o identificador do usuário a partir do token, nunca do corpo enviado pelo cliente;
- disponibilizar operações idempotentes baseadas em `sync_id`;
- retornar datas em ISO 8601;
- implementar paginação e sincronização incremental por `updated_at`;
- definir tratamento de conflitos entre alterações feitas em dispositivos diferentes;
- manter exclusões lógicas ou um log de alterações caso seja necessário sincronizar dispositivos que permaneçam offline por longos períodos;
- documentar a API com OpenAPI;
- criar testes de integração e contrato;
- manter segredos exclusivamente no servidor.

Uma API própria não deve acessar diretamente o SQLite do dispositivo. A comunicação continuará acontecendo por HTTP, enquanto o frontend será responsável por atualizar seu banco local.

## Modelo local e sincronização

Além dos campos compartilhados com o Supabase, a tabela SQLite utiliza:

| Campo | Finalidade |
|---|---|
| `id` | Identificador interno local |
| `sincronizado` | Indica se a versão local foi enviada ao backend |

O SQLite também mantém a tabela `exclusoes_pendentes`. Ela armazena os `sync_id` removidos localmente até que a exclusão correspondente seja confirmada pelo Supabase.

Conflitos simples são tratados preservando alterações locais ainda não sincronizadas. Para um cenário com múltiplos dispositivos alterando simultaneamente o mesmo registro, será necessário definir uma estratégia explícita, como last-write-wins, versionamento otimista ou resolução manual.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Não | URL pública do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Não | Chave pública usada pelo cliente Supabase |

Sem essas variáveis, o aplicativo continua funcionando localmente. O arquivo `.env` está ignorado pelo Git e não deve ser versionado.

## Qualidade e testes

Execute a verificação estática:

```bash
npm run typecheck
```

Execute os testes:

```bash
npm test
```

Os testes atuais cobrem conversão, formatação, validação e classificação de datas. Novas regras de negócio devem ser acompanhadas pelos respectivos testes unitários e, quando envolverem o Supabase, por testes de integração em um ambiente separado.

## Build web

Para validar ou gerar o bundle web:

```bash
npx expo export --platform web
```

Os arquivos são gerados em `dist/`. O `metro.config.js` registra arquivos `.wasm` como assets para permitir o uso do Expo SQLite no navegador.

Ao hospedar a versão web, verifique os requisitos de segurança e compatibilidade do SQLite WebAssembly no provedor escolhido, incluindo cabeçalhos necessários para recursos do navegador quando aplicável.

## Limitações atuais

- Os textos de bula são cadastrados manualmente e não são obtidos de uma base farmacêutica oficial.
- OCR e reconhecimento de embalagens não fazem parte da versão atual.
- A autenticação é anônima e não oferece recuperação de conta em outro dispositivo.
- A sincronização não possui resolução avançada de conflitos entre múltiplos dispositivos.
- O aplicativo não envia notificações de vencimento em segundo plano.

## Aviso de saúde

O Vida+ é uma ferramenta acadêmica de organização. As informações armazenadas ou exibidas não constituem diagnóstico, prescrição ou recomendação médica. A bula oficial do fabricante e a orientação de profissionais de saúde qualificados devem sempre prevalecer.
