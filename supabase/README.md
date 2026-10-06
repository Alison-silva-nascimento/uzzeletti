# Feedbacks públicos — ativação segura

## 1. Banco e RLS

No Supabase, abra **SQL Editor**, cole e execute `supabase/sql/feedbacks-setup.sql`.

Depois acesse **Integrations > Data API > Settings** e exponha `feedbacks` e `feedback_submission_limits`. A segunda é usada somente pela Edge Function: o SQL remove todos os privilégios de `anon` e `authenticated`, portanto ela não pode ser lida ou alterada pelo navegador. Mantenha *Automatically expose new tables* desligado.

## 2. Anti-spam obrigatório

1. Crie um widget Cloudflare Turnstile para `uzzeleti.com.br` e `www.uzzeleti.com.br`.
2. No Supabase: **Edge Functions > Secrets**, adicione `TURNSTILE_SECRET_KEY` com a chave secreta do Turnstile. Esta chave nunca entra no Git nem no frontend.
3. Publique a Edge Function em `supabase/functions/submit-feedback/index.ts` com JWT desligado, pois o endpoint é público e usa validação própria de origem + Turnstile.
4. Copie a *site key* (pública) do Turnstile para `TURNSTILE_SITE_KEY` em `js/feedbacks.js`.

## 3. Testes de segurança antes de liberar

- Na tela de feedbacks, envie uma mensagem válida: deve retornar 201 e aparecer na lista.
- Faça uma chamada REST direta com a chave pública para `POST /rest/v1/feedbacks`: deve retornar 401/403 por falta de privilégio de INSERT.
- Tente `PATCH` e `DELETE` na mesma rota: devem retornar 401/403.
- Envie ao endpoint uma requisição sem token Turnstile: deve retornar 400.
- Envie quatro feedbacks do mesmo navegador dentro de uma hora: o quarto deve retornar 429.
- Confirme que um texto contendo HTML é exibido como texto, não como marcação.
- Execute o **Security Advisor** do Supabase e corrija qualquer alerta relacionado às tabelas criadas.

A página nunca coleta e-mail, telefone, endereço, pedido ou outros dados de contato. Os únicos dados públicos são nome/apelido, nota, mensagem e data.

