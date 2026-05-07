# LineUp System — CLAUDE.md

## Visão Geral
Sistema gerador de lineups visuais para eventos de tecnologia. Organizadores criam eventos, montam grade horária e geram imagem PNG 1024x1024px compartilhável. Público acessa via link sem login.

## Stack (NÃO ALTERAR)
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript strict
- **Estilo**: Tailwind CSS dark mode + Shadcn/ui
- **Forms**: React Hook Form + Zod
- **Geração PNG**: html-to-image (client-side, sem API)
- **ORM**: Prisma + Neon (PostgreSQL serverless)
- **Auth**: NextAuth.js (email/senha + JWT)
- **Ícones**: Lucide React
- **Datas**: date-fns
- **Utils**: clsx + tailwind-merge

## Estrutura de Pastas
```
/lineup-system
├── prisma/schema.prisma          # Schema exato do DESIGN.md
├── src/app/
│   ├── (auth)/login/             # Rota pública
│   ├── (auth)/cadastro/          # Rota pública
│   ├── (dashboard)/home/         # Protegida
│   ├── (dashboard)/cadastro-lineup/ # Protegida
│   ├── (dashboard)/evento/[id]/editar/ # Protegida
│   ├── lineup/[slug]/            # Pública (readonly)
│   └── api/auth/[...nextauth]/
├── src/components/
│   ├── ui/                       # shadcn/ui
│   ├── lineup/                   # LineupCard, LineupGenerator, LineupPreview
│   ├── forms/                    # EventForm, StageForm, SpeakerForm, SessionForm
│   └── layout/                   # Header, Sidebar
├── src/lib/
│   ├── prisma.ts                 # Singleton
│   ├── auth.ts                   # NextAuth config
│   ├── utils.ts                  # generateSlug, etc
│   └── validations/              # Zod schemas
├── src/hooks/
├── src/types/index.ts
└── src/middleware.ts
```

## Schema do Banco (Prisma)
Modelos: `User`, `Event`, `Stage`, `Speaker`, `Session`, `SessionSpeaker`
- `Event.themeConfig` → JSON (`ThemeConfig`)
- `Speaker.socialLinks` → JSON (`SocialLinks`)
- `SessionSpeaker` → tabela de junção com `role` e `displayOrder`

## Rotas Protegidas (middleware.ts)
```
matcher: ["/home/:path*", "/cadastro-lineup/:path*", "/evento/:path*"]
```
Login redirect: `/login`

## Design System
- Dark mode padrão (`class` strategy)
- Background: `#0a0a0a`, Primary: `#00ff00`, Accent: `#ff00ff`
- Fontes: Inter (sans) + JetBrains Mono (mono)

## Lineup Visual (F7)
- Estilo: minimalista tech/terminal (inspirado em festivais eletrônicos)
- Resolução fixa: **1024x1024px PNG**
- Geração **client-side** via `html-to-image`
- Elementos obrigatórios: nome do evento, data gigante (centro), grade horária, localização/URL, grid de fundo sutil, elementos geométricos decorativos
- Referência visual: `/docs/lineup-reference.png`
- Layouts: `compact` e `spacious`

## Regras de Negócio Críticas
- `is_published = false` → evento não tem link público nem download
- Publicar exige: ≥1 palco, ≥1 sessão, zero conflitos de horário
- Palestrante não pode ter sessões sobrepostas no mesmo evento
- Usuário só edita/exclui eventos próprios (`created_by`)
- Slug único, URL-friendly, gerado do nome

## Detecção de Conflitos
Função SQL `check_speaker_conflict()` criada via migration manual.
No app: `prisma.$queryRaw` com OVERLAPS para checar sobreposição.
Bloquear submit se `hasConflict === true`.

## O que NÃO implementar (v1)
- Venda de ingressos, gestão de cachês, check-in
- Múltiplos temas por evento
- Colaboração multi-usuário
- Exportação PDF
- Integração com calendários

## Idioma
Todos os textos da UI em **português brasileiro (pt-BR)**.
Formatar datas em pt-BR.

## Ordem de Desenvolvimento (TASKS.md)
1. Setup do projeto (Next.js, Prisma, Neon, seed)
2. Autenticação (NextAuth, login, cadastro, middleware)
3. Home/Dashboard (lista de eventos, ações)
4. Cadastro básico do evento (wizard step 1)
5. Palcos e palestrantes (steps 2-3)
6. Grade de sessões (step 4, conflitos)
7. Customização visual (step 5, preview)
8. Publicação e download (step 6, PNG)
9. Página pública `/lineup/[slug]`
10. Edição de eventos
11. Polimento (loading states, toasts, responsividade)

**Uma task por vez. PARAR após cada task para validação.**
