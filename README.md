# LineUp System

Gerador de lineups visuais para eventos de tecnologia. Organizadores criam eventos com grade horária e geram imagem PNG 1024×1024px para compartilhar nas redes sociais.

## O que faz

- Cadastro e autenticação de organizadores
- Criação de eventos multi-dia com múltiplos palcos
- Cadastro de palestrantes e sessões
- Detecção de conflitos de horário em tempo real
- Geração de lineup visual estilo terminal/minimalista
- Download do lineup como PNG 1024×1024px
- Link público compartilhável (sem login)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS + Shadcn/ui |
| Auth | NextAuth.js (email/senha + JWT) |
| ORM | Prisma 7 |
| Banco | Neon (PostgreSQL serverless) |
| Formulários | React Hook Form + Zod |
| PNG | html-to-image (client-side) |

## Pré-requisitos

- Node.js 20+
- Conta no [Neon](https://neon.tech) com banco PostgreSQL criado

## Configuração

**1. Instalar dependências**
```bash
npm install
```

**2. Configurar variáveis de ambiente**

Crie `.env` na raiz:
```env
DATABASE_URL="postgresql://..."   # Connection string do Neon
```

Crie `.env.local` na raiz:
```env
DATABASE_URL="postgresql://..."   # Mesma URL
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**3. Rodar migrations**
```bash
npx prisma migrate dev
```

**4. Popular banco com dados de exemplo**
```bash
npm run db:seed
# Email: admin@lineup.com | Senha: 123456
```

**5. Iniciar servidor**
```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura

```
src/
├── app/
│   ├── (auth)/          # login, cadastro
│   ├── (dashboard)/     # home, cadastro-lineup, evento/[id]/editar
│   ├── lineup/[slug]/   # visualização pública
│   └── api/auth/        # NextAuth
├── components/
│   ├── ui/              # shadcn/ui
│   ├── lineup/          # LineupCard, LineupGenerator, LineupPreview
│   ├── forms/           # EventForm, StageForm, SpeakerForm, SessionForm
│   └── layout/          # Header, Sidebar
├── lib/
│   ├── prisma.ts        # Prisma client singleton
│   ├── auth.ts          # NextAuth config
│   ├── utils.ts         # cn(), generateSlug()
│   └── validations/     # Zod schemas
├── types/index.ts
└── middleware.ts        # Proteção de rotas
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Público | Login |
| `/cadastro` | Público | Cadastro |
| `/lineup/[slug]` | Público | Visualização do lineup |
| `/home` | Autenticado | Dashboard de eventos |
| `/cadastro-lineup` | Autenticado | Wizard criação de evento |
| `/evento/[id]/editar` | Autenticado | Edição de evento |

## Lineup Visual

Estilo minimalista tech/terminal inspirado em festivais de música eletrônica.

- Resolução: **1024×1024px PNG**
- Geração **client-side** (sem API)
- Paleta padrão: fundo preto, texto branco, acento verde neon `#00FF00`
- Layouts: `compact` e `spacious`
- Customizável: cores, fonte, logo

## Regras de Negócio

- Evento só publica com ≥1 palco, ≥1 sessão e zero conflitos de horário
- Palestrante não pode ter sessões sobrepostas no mesmo evento
- Link público `/lineup/[slug]` retorna 404 se evento não publicado
- Usuário só edita/exclui eventos próprios

## O que NÃO está no escopo (v1)

Venda de ingressos, pagamentos, check-in, múltiplos temas por evento, colaboração multi-usuário, exportação PDF.

## Documentação

- [`REQUIRIMENTS.md`](./REQUIRIMENTS.md) — funcionalidades e regras de negócio
- [`DESIGN.md`](./DESIGN.md) — stack, schema, decisões técnicas
- [`TASKS.md`](./TASKS.md) — lista de tarefas de desenvolvimento
- [`CLAUDE.md`](./CLAUDE.md) — contexto para agentes de IA
