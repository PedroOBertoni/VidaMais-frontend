# Vida+

MVP mobile para rastreamento de validade e consulta de bula de medicamentos.

## Stack
- React Native + Expo
- TypeScript
- Expo Router
- Expo SQLite
- Supabase / PostgreSQL

## Instalação
1. `npm install`
2. Copie `.env.example` para `.env` e preencha as credenciais do Supabase.
3. `npx expo start`

O app funciona com SQLite local mesmo sem configurar o Supabase. Quando as credenciais estiverem preenchidas, o cadastro também é enviado ao PostgreSQL.

## SQL do Supabase
Veja `supabase/schema.sql`.

## Observação
A visão computacional/OCR fica preparada para uma etapa posterior e não faz parte deste MVP.
