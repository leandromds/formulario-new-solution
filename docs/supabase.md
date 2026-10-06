# Etapa 2 — persistência de entrevistas

O fluxo continua sendo formulário → Finalizar entrevista → resumo. Somente
**Salvar entrevista** envia os dados ao Supabase. Após o envio, a entrevista é
encerrada e pode ser consultada pelo painel administrativo do Supabase.

## Configuração

1. Crie ou escolha o projeto no painel do Supabase.
2. Abra **SQL Editor**, crie uma consulta e execute todo o conteúdo de
   [`supabase/schema.sql`](../supabase/schema.sql), uma única vez. Ele cria somente
   `public.interviews`, ativa RLS, retira privilégios padrão e concede INSERT a
   `anon`, com uma única policy. Não adicione policies públicas de leitura.
3. Em **Table Editor**, confirme que `interviews` existe e que RLS está habilitado.
4. No diálogo **Connect** ou nas configurações de **Data API**, copie a URL do
   projeto. Em **Settings → API Keys**, copie a chave pública **Publishable key**
   (`sb_publishable_...`). Use a URL HTTP da API, não a conexão PostgreSQL.
   Nunca use a chave `service_role` ou uma chave secreta no frontend.
5. Na pasta `Formulario-de-pesquisa`, copie `.env.example` para `.env.local` e
   preencha:

   ```dotenv
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=SUA-CHAVE-PUBLICA-PUBLISHABLE
   ```

6. Execute `pnpm install` e `pnpm dev`. Reinicie o Vite após mudar as variáveis.
   Para publicar, configure essas mesmas variáveis no ambiente de build e rode
   `pnpm build`: o Vite incorpora os valores durante o build. `.env` e
   `.env.local` estão ignorados pelo Git; `.env.example` contém apenas campos vazios.
7. No celular, use HTTPS para disponibilizar `crypto.randomUUID()`. Em desenvolvimento,
   `localhost` também oferece o contexto seguro necessário.

Se a configuração estiver ausente ou inválida, o formulário e o rascunho continuam
funcionando. A tentativa de envio mostra a mensagem de erro e permite tentar novamente.

Referências oficiais: [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e
[INSERT sem retorno de dados](https://supabase.com/docs/reference/javascript/insert).

## Dados e adaptação da Etapa 1

- `Interview` foi preservado, com adição de `clientId`. A normalização original
  foi extraída para `normalize-interview.ts`; os cálculos e o Zod não mudaram.
- `answers` contém a entrevista normalizada completa, incluindo UUID, respostas
  e scores. As demais colunas contêm empresa, segmento, scores e `schema_version = 1`.
- `scores.paymentEvidence` é mapeado para `payment_score`. Para segmento “Outro”,
  a coluna `segment` recebe `company.segmentOther`, como no resumo. O objeto
  original completo continua em `answers`. Segmento permanece opcional no
  formulário existente; nesse caso, a coluna recebe uma string vazia.
- A chave do localStorage continua `pme-discovery-interview-draft:v1`. Rascunhos
  antigos são recuperados e recebem um UUID. O novo formato guarda `clientId`,
  `data`, `reviewed` e `persistence` (data de confirmação e indicação de duplicidade).
- O UUID é mantido ao editar e recarregar. Mesmo um formulário vazio guarda seu
  UUID. “Nova entrevista” e “Limpar rascunho”, após confirmação, criam outro UUID.
- O debounce de 500 ms continua. Revisão e sucesso gravam o rascunho imediatamente;
  `pagehide` e ocultação da página também gravam os valores mais recentes.
- Após reload no resumo, ele é reconstruído com os mesmos cálculos. Se já salvo,
  permanece encerrado, com envio desabilitado e sem botão Editar.
- A função `saveInterview` usa INSERT sem `.select()` nem upsert. Há bloqueio
  imediato de cliques concorrentes e timeout de 20 segundos. Se a resposta se
  perder após a gravação, tentar novamente com o mesmo UUID encontra a constraint
  `interviews_client_id_key` e encerra a entrevista com uma mensagem amigável.
- O armazenamento local permanece como proteção antes do envio. Se o navegador
  bloquear esse armazenamento, os dados permanecem apenas na sessão, como na Etapa 1.

## Teste manual do fluxo

Use dados fictícios durante a verificação.

1. Preencha uma entrevista e recarregue durante o formulário. Confirme a recuperação
   das respostas. No DevTools → Application → Local Storage, confira que `clientId`
   permanece igual; não imprima o rascunho no console.
2. Clique em **Finalizar entrevista**. Deve aparecer o resumo, sem requisição de
   INSERT em Network e sem nova linha no Table Editor.
3. Clique em **Editar entrevista**, altere uma resposta e finalize novamente.
   Confirme o resumo atualizado e o mesmo UUID.
4. Clique em **Salvar entrevista**. Enquanto a requisição estiver pendente, deve
   aparecer “Salvando...” e os botões devem estar desabilitados. Com throttling
   de rede, tente clicar duas vezes: deve haver somente um POST.
5. Confirme “Entrevista salva com sucesso.” e a ausência de Editar. No Table Editor,
   confira uma única linha com `client_id`, empresa, segmento, os três scores,
   `schema_version = 1`, `created_at` e a entrevista completa em `answers`.
6. Recarregue. A entrevista deve continuar no resumo como salva, sem novo POST.
7. Clique em **Nova entrevista** e cancele: os dados e o estado salvo permanecem.
   Clique novamente e confirme: formulário vazio na primeira etapa, novo UUID e
   `persistence: null`. A entrevista anterior permanece no banco.
8. Preencha outra entrevista, finalize e coloque Network em **Offline**, mantendo
   a página carregada. Clique em Salvar. Confirme a mensagem de erro, o resumo e
   as respostas preservadas no localStorage. Volte a **Online** e clique em
   **Tentar novamente**: deve salvar uma única linha.
9. Para simular resposta perdida, após um envio bem-sucedido, use somente um
   rascunho com dados fictícios: no editor de Local Storage, mantenha `clientId`
   e `data`, mas altere `persistence` para `null`, mantendo `reviewed: true`.
   Recarregue e salve. Deve aparecer “Esta entrevista já parece ter sido salva.”,
   bloquear novos envios e manter uma única linha no banco. Não faça isso com
   entrevistas reais.

## Conferência das permissões

No SQL Editor, execute:

```sql
select
  has_table_privilege('anon', 'public.interviews', 'INSERT') as anon_insert,
  has_table_privilege('anon', 'public.interviews', 'SELECT') as anon_select,
  has_table_privilege('anon', 'public.interviews', 'UPDATE') as anon_update,
  has_table_privilege('anon', 'public.interviews', 'DELETE') as anon_delete;

select relrowsecurity
from pg_class
where oid = 'public.interviews'::regclass;

select policyname, roles, cmd, with_check
from pg_policies
where schemaname = 'public' and tablename = 'interviews';
```

Esperado: `true, false, false, false`; RLS `true`; uma única policy, com papel
`anon`, comando `INSERT` e `with_check = true`. O acesso administrativo pelo
Table Editor continua disponível.

Para confirmar também o bloqueio das operações, execute cada tentativa abaixo
**separadamente**, sempre incluindo BEGIN e ROLLBACK:

```sql
begin;
set local role anon;
select * from public.interviews limit 1;
rollback;
```

```sql
begin;
set local role anon;
update public.interviews set schema_version = 1 where false;
rollback;
```

```sql
begin;
set local role anon;
delete from public.interviews where false;
rollback;
```

As três devem retornar `permission denied for table interviews`. Se a sessão
ficar em uma transação abortada após o erro, execute `rollback;` antes da próxima.

## Verificação local

```sh
pnpm build
pnpm lint
```

Não foi instalado framework de testes. O projeto não possuía infraestrutura de
testes automatizados na Etapa 1. A confirmação contra o seu projeto Supabase
depende de executar o SQL e configurar as variáveis descritas acima.
