/*
 * Configuração do Supabase.
 * Pegue os valores em: Supabase → Project Settings → API (ou "Data API" / "API Keys").
 *   supabaseUrl:     Project URL, ex.: https://abcdefgh.supabase.co
 *   supabaseAnonKey: chave pública "anon" (ou "publishable", começa com sb_publishable_)
 *
 * Essas duas informações são públicas por natureza: quem protege os dados são as
 * políticas (RLS) criadas pelo supabase/schema.sql. NUNCA coloque aqui a chave
 * "service_role" / "secret".
 *
 * Se deixar em branco, o site roda em modo demonstração (dados só no navegador).
 */
window.RAFA_CONFIG = {
  supabaseUrl: "https://soeitzqzdbygmszohygw.supabase.co",
  supabaseAnonKey: "sb_publishable_fUX3VV40JdyBZSsjkb9gyQ_Vv4dwnCm"
};
