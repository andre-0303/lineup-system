# LineUp System - Design Document

## Stack Tecnológica

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (customizado para dark mode)
- **Shadcn/ui** (componentes base)
- **React Hook Form** + **Zod** (validação de formulários)
- **html-to-image** ou **Canvas API** (geração de PNG)

### Backend
- **Next.js API Routes** (server actions)
- **Prisma ORM** (type-safe database queries)
- **NextAuth.js** (autenticação email/senha)

### Database
- **Neon (PostgreSQL)** (serverless)

### Outros
- **Lucide React** (ícones)
- **date-fns** (manipulação de datas)
- **clsx** + **tailwind-merge** (classes condicionais)

---

## Estrutura de Páginas

### Rotas Públicas

#### `/login`
- Formulário de login (email + senha)
- Link para `/cadastro`
- Redirect para `/home` após autenticação

#### `/cadastro`
- Formulário de cadastro (nome, email, senha)
- Link para `/login`
- Redirect para `/home` após registro

#### `/lineup/[slug]`
- Visualização pública do lineup (readonly)
- Não requer autenticação
- Botão para baixar PNG
- 404 se evento não existir ou não estiver publicado

---

### Rotas Protegidas (requer autenticação)

#### `/home`
- Dashboard com cards dos eventos criados pelo usuário
- Cada card mostra:
  - Nome do evento
  - Datas
  - Preview miniatura do lineup (se publicado)
  - Botões: Editar, Baixar PNG, Copiar Link, Excluir
- Botão flutuante "Novo Evento"
- Mensagem vazia se não houver eventos

#### `/cadastro-lineup`
- Wizard multi-step para criar evento
- **Step 1: Dados Básicos**
  - Nome, descrição, datas, localização
  - Geração automática de slug
- **Step 2: Palcos**
  - Adicionar/remover palcos
  - Nome e capacidade
- **Step 3: Palestrantes**
  - Adicionar/remover palestrantes
  - Formulário inline com campos básicos
- **Step 4: Grade de Sessões**
  - Interface visual para montar grade
  - Drag-and-drop ou formulário
  - Validação de conflitos em tempo real
- **Step 5: Customização Visual**
  - Escolher cores
  - Upload de logo
  - Preview ao vivo
- **Step 6: Publicar**
  - Preview final
  - Botão "Publicar Evento"
  - Gera link compartilhável

#### `/evento/[id]/editar`
- Mesma interface do cadastro
- Permite editar evento existente
- Botão "Salvar Alterações"

---

## Schema do Banco de Dados

### Prisma Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USUÁRIOS ====================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  events Event[]

  @@map("users")
}

// ==================== EVENTOS ====================

model Event {
  id          String    @id @default(uuid())
  slug        String    @unique
  name        String
  description String?
  startDate   DateTime  @map("start_date") @db.Date
  endDate     DateTime  @map("end_date") @db.Date
  location    String?
  themeConfig Json?     @map("theme_config") // ThemeConfig interface
  isPublished Boolean   @default(false) @map("is_published")
  createdBy   String    @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user     User      @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  stages   Stage[]
  sessions Session[]

  @@index([createdBy])
  @@map("events")
}

// ==================== PALCOS ====================

model Stage {
  id           String   @id @default(uuid())
  eventId      String   @map("event_id")
  name         String
  capacity     Int?
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  event    Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  sessions Session[]

  @@index([eventId])
  @@map("stages")
}

// ==================== PALESTRANTES ====================

model Speaker {
  id          String   @id @default(uuid())
  name        String
  bio         String?
  avatarUrl   String?  @map("avatar_url")
  company     String?
  role        String?
  socialLinks Json?    @map("social_links") // SocialLinks interface
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  sessionSpeakers SessionSpeaker[]

  @@map("speakers")
}

// ==================== SESSÕES ====================

model Session {
  id          String   @id @default(uuid())
  eventId     String   @map("event_id")
  stageId     String   @map("stage_id")
  title       String
  description String?
  sessionType String   @map("session_type") // 'talk' | 'workshop' | 'panel' | 'break' | 'keynote'
  startTime   DateTime @map("start_time")
  endTime     DateTime @map("end_time")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  event   Event            @relation(fields: [eventId], references: [id], onDelete: Cascade)
  stage   Stage            @relation(fields: [stageId], references: [id], onDelete: Cascade)
  speakers SessionSpeaker[]

  @@index([eventId])
  @@index([stageId])
  @@index([startTime, endTime])
  @@map("sessions")
}

// ==================== RELACIONAMENTO SESSÃO <-> PALESTRANTES ====================

model SessionSpeaker {
  id           String   @id @default(uuid())
  sessionId    String   @map("session_id")
  speakerId    String   @map("speaker_id")
  role         String   @default("speaker") // 'speaker' | 'moderator' | 'panelist'
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  speaker Speaker @relation(fields: [speakerId], references: [id], onDelete: Cascade)

  @@unique([sessionId, speakerId])
  @@index([sessionId])
  @@index([speakerId])
  @@map("session_speakers")
}
```

---

## Tipos TypeScript

```typescript
// src/types/index.ts

export interface ThemeConfig {
  primaryColor: string;      // hex: "#00FF00"
  backgroundColor: string;   // hex: "#000000"
  textColor: string;         // hex: "#FFFFFF"
  accentColor?: string;      // hex: "#FF00FF" (opcional)
  logoUrl?: string;
  fontFamily: 'monospace' | 'sans-serif' | 'serif';
  layout: 'compact' | 'spacious';
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export type SessionType = 'talk' | 'workshop' | 'panel' | 'break' | 'keynote';

export type SpeakerRole = 'speaker' | 'moderator' | 'panelist';

// Types gerados automaticamente do Prisma
export type { Event, Stage, Speaker, Session, SessionSpeaker, User } from '@prisma/client';

// Types compostos
export interface EventWithRelations extends Event {
  stages: Stage[];
  sessions: (Session & {
    stage: Stage;
    speakers: (SessionSpeaker & {
      speaker: Speaker;
    })[];
  })[];
}
```

---

## Funções SQL Customizadas

```sql
-- Migration para criar função de detecção de conflitos
-- prisma/migrations/XXXXX_add_conflict_check/migration.sql

CREATE OR REPLACE FUNCTION check_speaker_conflict(
  p_speaker_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_event_id UUID,
  p_exclude_session_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM sessions s
    JOIN session_speakers ss ON s.id = ss.session_id
    WHERE ss.speaker_id = p_speaker_id
      AND s.event_id = p_event_id
      AND s.id != COALESCE(p_exclude_session_id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND (p_start_time, p_end_time) OVERLAPS (s.start_time, s.end_time)
  );
END;
$$ LANGUAGE plpgsql;

-- Índices adicionais para performance
CREATE INDEX idx_sessions_event ON sessions(event_id);
CREATE INDEX idx_sessions_stage ON sessions(stage_id);
CREATE INDEX idx_sessions_time ON sessions(start_time, end_time);
CREATE INDEX idx_stages_event ON stages(event_id);
```

---

## Estrutura de Pastas
/lineup-system
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── cadastro/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── home/
│   │   │   │   └── page.tsx
│   │   │   ├── cadastro-lineup/
│   │   │   │   └── page.tsx
│   │   │   └── evento/
│   │   │       └── [id]/
│   │   │           └── editar/
│   │   │               └── page.tsx
│   │   ├── lineup/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── events/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── lineup/
│   │   │   ├── LineupCard.tsx
│   │   │   ├── LineupGenerator.tsx
│   │   │   └── LineupPreview.tsx
│   │   ├── forms/
│   │   │   ├── EventForm.tsx
│   │   │   ├── StageForm.tsx
│   │   │   ├── SpeakerForm.tsx
│   │   │   └── SessionForm.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config
│   │   ├── utils.ts               # Helper functions
│   │   └── validations/           # Zod schemas
│   │       ├── event.ts
│   │       ├── speaker.ts
│   │       └── session.ts
│   ├── hooks/
│   │   ├── useEvents.ts
│   │   └── useLineupGenerator.ts
│   ├── types/
│   │   └── index.ts               # Types customizados
│   └── middleware.ts              # Proteção de rotas
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json

---

## Configurações Importantes

### NextAuth Config

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};
```

### Middleware de Proteção

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/home/:path*", "/cadastro-lineup/:path*", "/evento/:path*"]
};
```

---

## Design System (Dark Mode)

### Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ededed",
        primary: {
          DEFAULT: "#00ff00",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#ededed",
        },
        accent: {
          DEFAULT: "#ff00ff",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#262626",
          foreground: "#a3a3a3",
        },
        border: "#333333",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Geração de Lineup Visual

### Estratégia de Renderização

```typescript
// src/lib/lineup-generator.ts
import { toPng } from 'html-to-image';
import { EventWithRelations, ThemeConfig } from '@/types';

export async function generateLineupPNG(
  event: EventWithRelations,
  theme: ThemeConfig
): Promise<Blob> {
  // 1. Criar elemento DOM invisível com o layout do lineup
  const container = document.createElement('div');
  container.style.width = '1024px';
  container.style.height = '1024px';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  
  // 2. Aplicar estilos do theme
  container.style.backgroundColor = theme.backgroundColor;
  container.style.color = theme.textColor;
  container.style.fontFamily = theme.fontFamily;
  
  // 3. Renderizar conteúdo (nome do evento, logo, grade de sessões)
  // ... (lógica de renderização)
  
  document.body.appendChild(container);
  
  // 4. Converter para PNG
  const blob = await toPng(container, {
    width: 1024,
    height: 1024,
    pixelRatio: 2
  });
  
  // 5. Limpar
  document.body.removeChild(container);
  
  return blob;
}
```

## 🎨 Referência Visual do LineUp

### Estilo de Design
O lineup gerado deve seguir o estilo **minimalista tech/terminal** com as seguintes características:

#### Layout Geral
- **Fundo**: Grid sutil (linhas finas formando quadriculado)
- **Proporção**: 1024x1024px (quadrado)
- **Margens**: ~80px em todos os lados
- **Divisões**: Background pode ter elementos geométricos em destaque (triângulos, barras)

#### Tipografia
- **Nome do Evento**: 
  - Posição: Topo esquerdo
  - Fonte: Monospace (baixa, outline style)
  - Tamanho: Grande (~60-80px)
  - Estilo: Letras espaçadas verticalmente ou quebradas em linhas
  
- **Data**:
  - Posição: Centro (destaque máximo)
  - Fonte: Monospace outline/stroke
  - Tamanho: Gigante (~200-300px)
  - Formato: DD.MM ou DD MM [símbolo]
  - Ano embaixo em tamanho menor

- **Grade de Horários**:
  - Posição: Parte inferior (~1/3 do espaço)
  - Fonte: Monospace
  - Tamanho: ~14-16px
  - Layout: Lista vertical com:
    - Horário à esquerda (formato HH:MM - HH:MM)
    - Descrição à direita (tipo de sessão)
    - Espaçamento consistente

- **Localização**:
  - Posição: Rodapé inferior
  - Fonte: Monospace
  - Tamanho: ~12-14px
  - Pode incluir URL do evento

#### Paleta de Cores (Padrão)
- **Fundo**: `#000000` (preto sólido)
- **Grid**: `#1a1a1a` (cinza muito escuro, sutil)
- **Texto principal**: `#FFFFFF` (branco)
- **Acento/Destaque**: `#00FF00` (verde neon) - usado em:
  - Elementos geométricos decorativos
  - Bordas ou ícones (ex: check mark ✓)
  - Possíveis highlights na grade

#### Elementos Decorativos
- **Formas geométricas**: Triângulos, barras diagonais em verde neon
- **Posicionamento**: Cantos (superior direito, inferior direito típico)
- **Tamanho**: Grandes, mas sem cobrir conteúdo
- **Rotação**: Elementos podem estar em ângulos (45°, etc)

#### Exemplo de Hierarquia Visual
┌─────────────────────────────────────┐
│ NOME DO EVENTO         [Logo?]   ▼ │ ← Triângulo verde
│ (pequeno, topo)                     │
│                                     │
│         11.11                       │ ← Data gigante
│         10.19        ◀──────────    │ ← Barra verde
│         2017                        │
│                                     │
│ {                                   │
│ 08:00 - 10:00    (workshop)        │
│ 10:00 - 10:30    (coffee break)    │
│ 10:30 - 11:45    (presentation)    │ ← Grade de horários
│ ...                                 │
│ }                                   │
│                                     │
│ //url.evento.com    location      ▲│ ← Triângulo verde
└─────────────────────────────────────┘

### Variações de Layout

#### Layout "Compact" (Padrão)
- Data ocupa ~40% do espaço vertical central
- Grade de horários compacta (linha única por sessão)
- Elementos decorativos menores
- Mais informação, menos espaço vazio

#### Layout "Spacious"
- Data ocupa ~30% do espaço
- Grade de horários com mais espaçamento vertical
- Possibilidade de avatares dos palestrantes (pequenos)
- Elementos decorativos maiores
- Mais "respiro" visual

### Customização Permitida
- ✅ Cores (primária, fundo, texto, acento)
- ✅ Fonte (monospace, sans-serif, serif)
- ✅ Layout (compact, spacious)
- ✅ Logo (opcional, canto superior)
- ✅ Elementos decorativos (posição, cor)
- ❌ Estrutura geral (deve manter hierarquia)
- ❌ Proporção (sempre 1024x1024px)

### Assets de Referência
Ver arquivo: `/docs/lineup-reference.png` (imagem anexada pelo usuário)

### Fontes Recomendadas
- **Monospace**: JetBrains Mono, Fira Code, Roboto Mono, Space Mono
- **Sans-serif**: Inter, Poppins, Outfit
- **Serif**: Playfair Display, Lora (não recomendado para este estilo)

### Implementação Técnica
```typescript
// Exemplo de estrutura do gerador
interface LineupCanvasConfig {
  width: 1024;
  height: 1024;
  theme: ThemeConfig;
  layout: 'compact' | 'spacious';
  
  sections: {
    header: { height: 180 }; // Nome do evento + logo
    dateDisplay: { height: 400 }; // Data gigante
    schedule: { height: 360 }; // Grade de horários
    footer: { height: 84 }; // Localização + URL
  };
  
  decorations: {
    topRight: 'triangle' | 'bar' | 'none';
    bottomRight: 'triangle' | 'bar' | 'none';
    grid: boolean; // Mostrar grid de fundo
  };
}
```

### Elementos Obrigatórios no LineUp Final
1. ✅ Nome do evento
2. ✅ Data(s) do evento em destaque
3. ✅ Grade completa de horários com sessões
4. ✅ Localização
5. ⚠️ Logo (se fornecido)
6. ⚠️ URL público (se evento publicado)

---

## Validações com Zod

```typescript
// src/lib/validations/event.ts
import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'Data final deve ser maior ou igual à data inicial',
  path: ['endDate']
});

export const sessionSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  sessionType: z.enum(['talk', 'workshop', 'panel', 'break', 'keynote']),
  startTime: z.date(),
  endTime: z.date(),
  stageId: z.string().uuid(),
  speakerIds: z.array(z.string().uuid()).min(1, 'Adicione pelo menos um palestrante')
}).refine(data => data.endTime > data.startTime, {
  message: 'Horário final deve ser maior que horário inicial',
  path: ['endTime']
});
```

---

## Observações Finais

- **Server Actions**: Usar para mutations (criar, editar, excluir)
- **React Query**: Considerar para cache de dados (opcional)
- **Optimistic Updates**: Melhorar UX em ações rápidas
- **Error Boundaries**: Capturar erros de componentes
- **Loading States**: Skeleton loaders em todas as páginas