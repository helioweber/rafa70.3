# Rafa Tri Challenge

Portal do desafio de triathlon **Rafa Tri Challenge** entre amigos, em Porto Alegre/RS.

Rampa de 4 níveis, com as distâncias padrão do triathlon (voltas no circuito de 2 km):

| Nível | Natação | Bike | Corrida |
|---|---|---|---|
| Sprint | 750 m | 20 km (10 voltas) | 5 km (2,5 voltas) |
| Olímpico | 1.500 m | 40 km (20 voltas) | 10 km (5 voltas) |
| 70.3 | 1.900 m | 90 km (45 voltas) | 21,1 km (10,5 voltas) |
| Full | 3.800 m | 180 km (90 voltas) | 42,2 km (21 voltas) |

Todo mundo começa no **Sprint**. Cada nível só libera depois de uma **prova completa** (natação, bike e corrida) no nível anterior. A corrida do 70.3 e a do Full usam 10,5 e 21 voltas, cerca de 100 e 200 m abaixo da distância oficial.
- **Circuito:** 2,0 km, com largada e chegada na Rossi Fiateci (Av. Polônia, 255 – São Geraldo)

Site: https://helioweber.github.io/rafa70.3/

O que tem no site: página inicial, mapa do percurso, login com Google, inscrição, portal do atleta (tempos, fotos e contador de voltas), ranking e galeria. É um site estático (HTML + JS), sem build, e usa o **Supabase** para login, banco de dados e fotos.

```
index.html            o site
config.js             URL e chave pública do Supabase
supabase/schema.sql   cria tabelas, permissões, bucket de fotos e tempo real
.nojekyll             necessário para o GitHub Pages
```

Sem o `config.js` preenchido, o site roda em **modo demonstração**, com os dados salvos só no navegador. Serve para testar o visual.

---

## 1. Banco de dados (Supabase)

1. No projeto do Supabase, abra **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria:
   - `athletes`: inscrições, uma por conta
   - `registros`: provas e treinos, com nível, tempos em segundos e fotos
   - `liberacoes`: liberação manual de nível pelo organizador
   - a regra da rampa, que o próprio banco aplica (ninguém burla editando o site)
   - `config`: data, hora, local da natação e recado do evento
   - `admins`: organizadores
   - o bucket público `fotos`, onde cada usuário só envia arquivos na própria pasta
   - as regras de segurança (RLS): todos veem o ranking e cada um só altera os próprios dados
   - o tempo real ligado, para o ranking atualizar sozinho
2. O script pode ser executado de novo sem problema. Se você já tinha rodado a versão antiga (só 70.3 e Sprint), rode este de novo: ele atualiza o banco e mantém os dados e o nível que cada atleta já tinha.

## 2. Login com Google

**No Google Cloud** (console.cloud.google.com):

1. Em **Google Auth Platform**, configure a tela de consentimento (público **Externo**, nome do app `Rafa Tri Challenge`) e clique em **Publicar app**, para qualquer pessoa conseguir entrar.
2. Em **Clientes → Criar cliente → Aplicativo da Web**, preencha:
   - **Origens JavaScript autorizadas:** `https://helioweber.github.io`
   - **URIs de redirecionamento autorizados:** a *Callback URL* que o Supabase mostra em **Authentication → Sign In / Providers → Google** (formato `https://SEU-PROJETO.supabase.co/auth/v1/callback`)
3. Copie o **Client ID** e o **Client Secret**.

**No Supabase:**

1. Em **Authentication → Sign In / Providers → Google**, ative o provedor e cole o Client ID e o Client Secret.
2. Em **Authentication → URL Configuration**:
   - **Site URL:** `https://helioweber.github.io/rafa70.3/`
   - **Redirect URLs:** adicione a mesma URL.

> O **Client Secret** fica só no Supabase. Nunca coloque no `config.js`, no GitHub nem em prints ou conversas.

## 3. Conectar o site ao Supabase

Copie a **Project URL** e a chave **publishable** (em **Project Settings → API Keys**) para o `config.js`:

```js
window.RAFA_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseAnonKey: "sb_publishable_..."
};
```

> A chave publishable é pública e pode ir para o GitHub, porque quem protege os dados são as regras de RLS. **Nunca** use a chave `service_role` / `secret` no site.

## 4. Publicar no GitHub Pages

1. Envie todos os arquivos para o repositório, inclusive o `.nojekyll` e a pasta `supabase/`.
2. Em **Settings → Pages → Deploy from a branch → main / (root) → Save**.
3. Em cerca de 1 minuto o site fica no ar. Para atualizar, edite ou substitua os arquivos no GitHub e aguarde o novo deploy (aba **Actions**).

Se uma mudança não aparecer, force a atualização com **Cmd/Ctrl + Shift + R** ou abra numa janela anônima.

## 5. Virar organizador

Entre no site com sua conta Google. Depois rode no SQL Editor:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'SEU-EMAIL@gmail.com';
```

Recarregue o site. Vai aparecer o botão **Editar dados do evento** na página inicial, para definir data, horário, local da natação e recado. Como organizador você também pode editar ou apagar inscrições e registros de qualquer atleta pelo **Table Editor** do Supabase.

## Rampa de níveis

- Provas e treinos têm um nível. Só aparecem para o atleta os níveis liberados.
- Uma prova **completa** (natação, bike e corrida preenchidas) no nível N libera o nível N+1. Treino não conta.
- O ranking é por nível: o atleta aparece em cada nível onde tiver prova completa.
- O organizador entra em qualquer nível. Para liberar manualmente um amigo já inscrito (SQL Editor):

```sql
insert into public.liberacoes (athlete_id, ate)
select id, 'olimpico' from auth.users where email = 'AMIGO@exemplo.com'
on conflict (athlete_id) do update set ate = excluded.ate, atualizado_em = now();
```

Valores de `ate`: `sprint`, `olimpico`, `703`, `full`.

## Personalizar

No `index.html`, começo do `<script>`:

- `LEVELS` e `CH`: ordem, distâncias e voltas de cada nível
- `ROUTE`: endereços usados no link do Google Maps

Para criar um nível novo, além de incluí-lo em `LEVELS` e `CH`, é preciso ajustar `nivel_idx` e as regras `check` de `desafio` no `schema.sql` (hoje aceitam `sprint`, `olimpico`, `703` e `full`).

## Observações

- As fotos são reduzidas no navegador (até 1600 px, JPEG) antes do envio, para economizar espaço no plano gratuito.
- O contador de voltas fica salvo só no aparelho do atleta. Ao finalizar, ele preenche o tempo no formulário.
- O plano gratuito do Supabase pausa projetos parados por cerca de 1 semana. Se o site parar de carregar dados, entre no painel e clique em **Restore**.
- Se o login com Google der `redirect_uri_mismatch`, a URI de redirecionamento no Google Cloud está diferente da Callback URL do Supabase. Elas precisam ser idênticas.
