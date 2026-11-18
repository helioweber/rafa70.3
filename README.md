# Rafa 70.3

Portal do desafio de triathlon **Rafa 70.3** entre amigos, em Porto Alegre/RS.

- **70.3:** 1.900 m natação · 90 km bike (45 voltas) · 22 km corrida (11 voltas)
- **Sprint:** 700 m natação · 20 km bike (10 voltas) · 5 km corrida (2,5 voltas)
- **Circuito:** 2,0 km, com largada e chegada na Rossi Fiateci (Av. Polônia, 255 – São Geraldo)

O que tem no site: página inicial, mapa do percurso, cadastro com e-mail e senha, inscrição, portal do atleta (tempos, fotos e contador de voltas), ranking e galeria. É um site estático (HTML + JS), sem build, e usa o **Supabase** para login, banco de dados e fotos.

```
index.html            o site
config.js             URL e chave pública do Supabase  ← você edita
supabase/schema.sql   cria tabelas, permissões, bucket de fotos e tempo real
.nojekyll             necessário para o GitHub Pages
```

Sem o `config.js` preenchido, o site roda em **modo demonstração**, com os dados salvos só no navegador. Serve para testar o visual.

---

## 1. Configurar o Supabase

1. Abra o projeto no Supabase, vá em **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria:
   - `athletes`: inscrições, uma por conta
   - `registros`: provas e treinos, com tempos em segundos e fotos
   - `config`: data, hora, local da natação e recado do evento
   - `admins`: organizadores
   - o bucket público `fotos`, onde cada usuário só envia arquivos na própria pasta
   - as regras de segurança (RLS): todos veem o ranking e cada um só altera os próprios dados
   - o tempo real ligado, para o ranking atualizar sozinho
2. Em **Authentication → URL Configuration**:
   - **Site URL:** `https://SEU-USUARIO.github.io/rafa703/`
   - **Redirect URLs:** adicione a mesma URL. Ela é usada nos e-mails de confirmação de conta e de troca de senha.
3. Em **Authentication → Sign In / Providers → Email**, decida sobre o **Confirm email**:
   - **ligado** (padrão): o amigo precisa clicar no link do e-mail antes de entrar.
   - **desligado**: entra direto após criar a conta. É mais simples para um grupo de amigos.
4. Copie **Project URL** e a chave **anon / publishable** (em **Project Settings → API Keys**) para o `config.js`:

```js
window.RAFA_CONFIG = {
  supabaseUrl: "https://abcdefgh.supabase.co",
  supabaseAnonKey: "eyJhbGciOi..."   // ou sb_publishable_...
};
```

> A chave anon/publishable é pública e pode ir para o GitHub, porque quem protege os dados são as regras de RLS. **Nunca** use a chave `service_role` / `secret` no site.

## 2. Publicar no GitHub Pages

1. Crie o repositório (ex.: `rafa703`) e envie todos os arquivos, inclusive a pasta `supabase/`.
2. Vá em **Settings → Pages → Deploy from a branch → main / (root) → Save**.
3. Em cerca de 1 minuto o site fica no ar em `https://SEU-USUARIO.github.io/rafa703/`.

## 3. Virar organizador

Crie sua conta pelo próprio site. Depois rode no SQL Editor:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'SEU-EMAIL@exemplo.com';
```

Recarregue o site. Vai aparecer o botão **Editar dados do evento** na página inicial, para definir data, horário, local da natação e recado. Como organizador você também pode editar ou apagar inscrições e registros de qualquer atleta pelo painel do Supabase (**Table Editor**).

## Personalizar

No `index.html`, começo do `<script>`:

- `CH`: distâncias e voltas de cada desafio
- `ROUTE`: endereços usados no link do Google Maps

## Observações

- As fotos são reduzidas no navegador (até 1600 px, JPEG) antes do envio, para economizar espaço no plano gratuito.
- O contador de voltas fica salvo só no aparelho do atleta. Ao finalizar, ele preenche o tempo no formulário.
- O plano gratuito do Supabase pausa projetos parados por cerca de 1 semana. Se o site parar de carregar dados, entre no painel e clique em **Restore**.
