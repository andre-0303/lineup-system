# LineUp System - Task List

> **Metodologia**: Desenvolvimento incremental com validações a cada etapa.  
> Cada task termina com **PARA AQUI** - não avance sem validar.

---

## 🔧 Task 1: Setup do Projeto

### Objetivos
- Criar estrutura inicial do projeto
- Configurar Prisma com Neon
- Rodar migrations e seed inicial

### Checklist

- [ ] Criar projeto Next.js 15 com TypeScript
```bash
  npx create-next-app@latest lineup-system --typescript --tailwind --app --no-src-dir
  cd lineup-system
```

- [ ] Instalar dependências
```bash
  npm install prisma @prisma/client next-auth bcryptjs zod react-hook-form @hookform/resolvers
  npm install -D @types/bcryptjs
```

- [ ] Configurar Prisma
```bash
  npx prisma init
```

- [ ] Copiar schema completo do DESIGN.md para `prisma/schema.prisma`

- [ ] Configurar variável de ambiente `.env.local`
```env
  DATABASE_URL="postgresql://..." # Neon database URL
  NEXTAUTH_SECRET="seu-secret-aqui" # openssl rand -base64 32
  NEXTAUTH_URL="http://localhost:3000"
```

- [ ] Rodar migration inicial
```bash
  npx prisma migrate dev --name init
```

- [ ] Criar seed com dados de exemplo
```typescript
  // prisma/seed.ts
  import { PrismaClient } from '@prisma/client';
  import { hash } from 'bcryptjs';

  const prisma = new PrismaClient();

  async function main() {
    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        email: 'admin@lineup.com',
        password: await hash('123456', 10),
        name: 'Admin Teste'
      }
    });

    // Criar evento de exemplo
    const event = await prisma.event.create({
      data: {
        slug: 'devconf-2024',
        name: 'DevConf 2024',
        description: 'Conferência de desenvolvimento de software',
        startDate: new Date('2024-11-15'),
        endDate: new Date('2024-11-15'),
        location: 'São Paulo, SP',
        isPublished: true,
        createdBy: user.id,
        themeConfig: {
          primaryColor: '#00ff00',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          fontFamily: 'monospace',
          layout: 'compact'
        }
      }
    });

    // Criar palcos
    const mainStage = await prisma.stage.create({
      data: {
        eventId: event.id,
        name: 'Main Stage',
        capacity: 500,
        displayOrder: 0
      }
    });

    const workshopRoom = await prisma.stage.create({
      data: {
        eventId: event.id,
        name: 'Workshop Room',
        capacity: 50,
        displayOrder: 1
      }
    });

    // Criar palestrantes
    const speaker1 = await prisma.speaker.create({
      data: {
        name: 'João Silva',
        bio: 'Senior Software Engineer',
        company: 'Tech Corp',
        role: 'Tech Lead',
        socialLinks: {
          twitter: '@joaosilva',
          linkedin: '/in/joaosilva'
        }
      }
    });

    const speaker2 = await prisma.speaker.create({
      data: {
        name: 'Maria Santos',
        bio: 'DevOps Specialist',
        company: 'Cloud Inc',
        role: 'DevOps Lead'
      }
    });

    // Criar sessões
    const session1 = await prisma.session.create({
      data: {
        eventId: event.id,
        stageId: mainStage.id,
        title: 'Keynote: O Futuro do JavaScript',
        description: 'Discussão sobre as tendências do JS',
        sessionType: 'keynote',
        startTime: new Date('2024-11-15T09:00:00'),
        endTime: new Date('2024-11-15T10:00:00')
      }
    });

    const session2 = await prisma.session.create({
      data: {
        eventId: event.id,
        stageId: workshopRoom.id,
        title: 'Workshop: Docker na Prática',
        description: 'Aprenda Docker do zero',
        sessionType: 'workshop',
        startTime: new Date('2024-11-15T10:30:00'),
        endTime: new Date('2024-11-15T12:00:00')
      }
    });

    // Vincular palestrantes às sessões
    await prisma.sessionSpeaker.create({
      data: {
        sessionId: session1.id,
        speakerId: speaker1.id,
        role: 'speaker',
        displayOrder: 0
      }
    });

    await prisma.sessionSpeaker.create({
      data: {
        sessionId: session2.id,
        speakerId: speaker2.id,
        role: 'speaker',
        displayOrder: 0
      }
    });

    console.log('✅ Seed concluído!');
    console.log('📧 Email: admin@lineup.com');
    console.log('🔑 Senha: 123456');
  }

  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
```

- [ ] Adicionar script no `package.json`
```json
  {
    "prisma": {
      "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
    },
    "scripts": {
      "db:seed": "prisma db seed"
    }
  }
```

- [ ] Rodar seed
```bash
  npm run db:seed
```

- [ ] Verificar dados no banco
```bash
  npx prisma studio
```

### Critérios de Aceite
- ✅ Projeto Next.js rodando em `localhost:3000`
- ✅ Prisma conectado ao Neon
- ✅ Tabelas criadas no banco
- ✅ Seed executado com sucesso
- ✅ Prisma Studio mostrando dados de exemplo

**🛑 PARA AQUI - Validar antes de prosseguir**

---

## 🔐 Task 2: Autenticação

### Objetivos
- Implementar NextAuth com email/senha
- Criar páginas de login e cadastro
- Proteger rotas do dashboard

### Checklist

- [ ] Instalar shadcn/ui
```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button input card label
```

- [ ] Criar arquivo de configuração do NextAuth
```typescript
  // src/app/api/auth/[...nextauth]/route.ts
  import NextAuth from "next-auth";
  import { authOptions } from "@/lib/auth";

  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
```

- [ ] Implementar `authOptions` conforme DESIGN.md (`src/lib/auth.ts`)

- [ ] Criar Prisma client singleton
```typescript
  // src/lib/prisma.ts
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  export const prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] Criar página de login (`src/app/(auth)/login/page.tsx`)
  - Formulário com email e senha
  - Validação com Zod
  - Link para `/cadastro`
  - Redirect para `/home` após sucesso

- [ ] Criar página de cadastro (`src/app/(auth)/cadastro/page.tsx`)
  - Formulário com nome, email e senha
  - Hash de senha com bcryptjs
  - Link para `/login`
  - Auto-login após cadastro

- [ ] Criar middleware de proteção
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

- [ ] Configurar layout raiz com Provider
```typescript
  // src/app/layout.tsx
  import { SessionProvider } from "next-auth/react";
  import "./globals.css";

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="pt-BR" className="dark">
        <body>
          <SessionProvider>{children}</SessionProvider>
        </body>
      </html>
    );
  }
```

### Critérios de Aceite
- ✅ Usuário consegue fazer cadastro
- ✅ Usuário consegue fazer login
- ✅ Senha é hasheada no banco
- ✅ Sessão persiste após reload
- ✅ Rotas protegidas redirecionam para `/login`
- ✅ Dark mode aplicado globalmente

**🛑 PARA AQUI - Testar fluxo completo de autenticação**

---

## 🏠 Task 3: Página Home (Dashboard)

### Objetivos
- Listar eventos do usuário logado
- Mostrar preview dos lineups
- Ações rápidas nos cards

### Checklist

- [ ] Criar Server Action para buscar eventos
```typescript
  // src/app/(dashboard)/home/actions.ts
  "use server";
  
  import { prisma } from "@/lib/prisma";
  import { getServerSession } from "next-auth";
  import { authOptions } from "@/lib/auth";

  export async function getUserEvents() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    return prisma.event.findMany({
      where: { createdBy: session.user.id },
      include: {
        _count: {
          select: { sessions: true, stages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
```

- [ ] Criar componente `EventCard`
```typescript
  // src/components/lineup/EventCard.tsx
  interface EventCardProps {
    event: Event & { _count: { sessions: number; stages: number } };
  }
```

- [ ] Criar página `/home`
  - Grid responsivo de cards
  - Botão flutuante "Novo Evento" (canto inferior direito)
  - Mensagem vazia com ilustração se não houver eventos
  - Loading skeleton enquanto carrega

- [ ] Adicionar ações no card
  - Botão "Editar" → `/evento/[id]/editar`
  - Botão "Baixar PNG" → download direto
  - Botão "Copiar Link" → copia `/lineup/[slug]`
  - Botão "Excluir" → modal de confirmação

- [ ] Implementar exclusão de evento
```typescript
  // src/app/(dashboard)/home/actions.ts
  export async function deleteEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autorizado");

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdBy: true }
    });

    if (event?.createdBy !== session.user.id) {
      throw new Error("Você não tem permissão para excluir este evento");
    }

    await prisma.event.delete({ where: { id: eventId } });
  }
```

### Critérios de Aceite
- ✅ Mostra apenas eventos do usuário logado
- ✅ Cards exibem informações básicas (nome, datas, nº de sessões)
- ✅ Botão "Novo Evento" redireciona para `/cadastro-lineup`
- ✅ Exclusão funciona e pede confirmação
- ✅ Link copiado para clipboard com feedback visual
- ✅ Mensagem vazia quando não há eventos

**🛑 PARA AQUI - Validar dashboard funcionando**

---

## 📝 Task 4: Cadastro de Evento (Parte 1 - Dados Básicos)

### Objetivos
- Wizard step 1: informações básicas do evento
- Salvar como rascunho
- Geração automática de slug

### Checklist

- [ ] Criar validação Zod para evento
```typescript
  // src/lib/validations/event.ts
  import { z } from 'zod';

  export const eventBasicSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    location: z.string().min(3, 'Localização obrigatória'),
  }).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'Data final deve ser maior ou igual à data inicial',
    path: ['endDate']
  });
```

- [ ] Criar função para gerar slug
```typescript
  // src/lib/utils.ts
  export function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove especiais
      .replace(/\s+/g, '-') // Espaços → hífens
      .replace(/-+/g, '-') // Múltiplos hífens → único
      .trim();
  }
```

- [ ] Criar componente `EventBasicForm`
  - Campos: nome, descrição, data início, data fim, localização
  - Preview do slug gerado em tempo real
  - Botão "Próximo"

- [ ] Criar Server Action para salvar rascunho
```typescript
  // src/app/cadastro-lineup/actions.ts
  "use server";

  export async function createEventDraft(data: z.infer<typeof eventBasicSchema>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autorizado");

    const slug = generateSlug(data.name);
    
    // Verificar slug único
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      // Adicionar sufixo numérico
      slug = `${slug}-${Date.now()}`;
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        slug,
        isPublished: false,
        createdBy: session.user.id
      }
    });

    return event.id;
  }
```

- [ ] Criar página `/cadastro-lineup` com wizard
  - Stepper visual (1/5 steps)
  - Formulário step 1
  - Salvar e ir para step 2

### Critérios de Aceite
- ✅ Formulário valida campos obrigatórios
- ✅ Slug gerado automaticamente e mostrado
- ✅ Evento salvo como rascunho (`isPublished = false`)
- ✅ Redirect para step 2 após salvar

**🛑 PARA AQUI - Validar cadastro básico**

---

## 🎭 Task 5: Cadastro de Evento (Parte 2 - Palcos e Palestrantes)

### Objetivos
- Wizard steps 2 e 3
- CRUD de palcos e palestrantes

### Checklist

- [ ] Criar validação Zod para palco
```typescript
  // src/lib/validations/stage.ts
  export const stageSchema = z.object({
    name: z.string().min(3),
    capacity: z.number().int().positive().optional(),
  });
```

- [ ] Criar validação Zod para palestrante
```typescript
  // src/lib/validations/speaker.ts
  export const speakerSchema = z.object({
    name: z.string().min(3),
    bio: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    socialLinks: z.object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
    }).optional(),
  });
```

- [ ] Criar componente `StageForm` (step 2)
  - Lista de palcos cadastrados
  - Formulário inline para adicionar novo
  - Botão de excluir palco
  - Reordenar palcos (drag-and-drop opcional)
  - Botão "Próximo"

- [ ] Criar Server Actions para palcos
```typescript
  export async function addStage(eventId: string, data: z.infer<typeof stageSchema>) {
    // Validar ownership do evento
    // Criar palco
  }

  export async function deleteStage(stageId: string) {
    // Validar ownership
    // Verificar se tem sessões vinculadas
    // Excluir
  }
```

- [ ] Criar componente `SpeakerForm` (step 3)
  - Lista de palestrantes cadastrados
  - Formulário inline para adicionar
  - Upload de avatar (opcional - usar placeholder por enquanto)
  - Botão "Próximo"

- [ ] Criar Server Actions para palestrantes
```typescript
  export async function addSpeaker(data: z.infer<typeof speakerSchema>) {
    return prisma.speaker.create({ data });
  }

  export async function deleteSpeaker(speakerId: string) {
    // Verificar se tem sessões vinculadas
    // Excluir
  }
```

### Critérios de Aceite
- ✅ Consegue adicionar/remover palcos
- ✅ Consegue adicionar/remover palestrantes
- ✅ Validações funcionando
- ✅ Wizard salva progresso entre steps
- ✅ Não permite excluir palco com sessões vinculadas

**🛑 PARA AQUI - Validar CRUD de palcos e palestrantes**

---

## 📅 Task 6: Cadastro de Evento (Parte 3 - Grade de Sessões)

### Objetivos
- Wizard step 4
- Montar grade horária
- Detecção de conflitos em tempo real

### Checklist

- [ ] Criar validação Zod para sessão
```typescript
  // src/lib/validations/session.ts
  export const sessionSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    sessionType: z.enum(['talk', 'workshop', 'panel', 'break', 'keynote']),
    stageId: z.string().uuid(),
    startTime: z.string().transform(str => new Date(str)),
    endTime: z.string().transform(str => new Date(str)),
    speakerIds: z.array(z.string().uuid()).min(1, 'Adicione pelo menos um palestrante'),
  }).refine(data => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Horário final deve ser maior que horário inicial',
    path: ['endTime']
  });
```

- [ ] Criar componente `SessionForm`
  - Campos: título, descrição, tipo, palco, horários
  - Select múltiplo de palestrantes
  - Badge visual do tipo de sessão

- [ ] Criar visualização de grade
  - Timeline visual por palco
  - Blocos coloridos por tipo de sessão
  - Hover mostra detalhes
  - Click para editar

- [ ] Implementar detecção de conflitos
```typescript
  // src/lib/conflict-detector.ts
  export async function checkConflicts(
    eventId: string,
    speakerIds: string[],
    startTime: Date,
    endTime: Date,
    excludeSessionId?: string
  ): Promise<{ hasConflict: boolean; conflicts: Conflict[] }> {
    const conflicts = await prisma.$queryRaw`
      SELECT 
        s.title,
        s.start_time,
        s.end_time,
        sp.name as speaker_name
      FROM sessions s
      JOIN session_speakers ss ON s.id = ss.session_id
      JOIN speakers sp ON ss.speaker_id = sp.id
      WHERE s.event_id = ${eventId}
        AND ss.speaker_id = ANY(${speakerIds})
        AND s.id != COALESCE(${excludeSessionId}, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (${startTime}::timestamptz, ${endTime}::timestamptz) OVERLAPS (s.start_time, s.end_time)
    `;

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  }
```

- [ ] Criar Server Action para criar sessão
```typescript
  export async function createSession(
    eventId: string,
    data: z.infer<typeof sessionSchema>
  ) {
    // 1. Verificar conflitos
    const { hasConflict, conflicts } = await checkConflicts(
      eventId,
      data.speakerIds,
      data.startTime,
      data.endTime
    );

    if (hasConflict) {
      throw new Error(`Conflito detectado: ${conflicts[0].speaker_name} já está em "${conflicts[0].title}"`);
    }

    // 2. Criar sessão
    const session = await prisma.session.create({
      data: {
        eventId,
        stageId: data.stageId,
        title: data.title,
        description: data.description,
        sessionType: data.sessionType,
        startTime: data.startTime,
        endTime: data.endTime,
      }
    });

    // 3. Vincular palestrantes
    await prisma.sessionSpeaker.createMany({
      data: data.speakerIds.map((speakerId, index) => ({
        sessionId: session.id,
        speakerId,
        displayOrder: index
      }))
    });

    return session;
  }
```

- [ ] Adicionar feedback visual de conflitos
  - Badge vermelho se houver conflito
  - Tooltip explicando o conflito
  - Bloquear botão "Próximo" se houver conflitos

### Critérios de Aceite
- ✅ Consegue criar sessões com múltiplos palestrantes
- ✅ Conflitos são detectados em tempo real
- ✅ Grade visual mostra todas as sessões
- ✅ Validações impedem criar sessões inválidas
- ✅ Não permite avançar com conflitos pendentes

**🛑 PARA AQUI - Validar montagem de grade e detecção de conflitos**

---

## 🎨 Task 7: Customização Visual do LineUp

### Objetivos
- Wizard step 5
- Escolher cores e layout
- Preview ao vivo

### Checklist

- [ ] Criar componente `ThemeCustomizer`
  - Color pickers para: primaryColor, backgroundColor, textColor, accentColor
  - Radio buttons para fontFamily
  - Radio buttons para layout (compact/spacious)
  - Upload de logo (opcional)

- [ ] Criar componente `LineupPreview`
  - Renderiza preview estilo da imagem de referência
  - Aplica theme em tempo real
  - Mostra nome do evento, logo, datas, local
  - Grade de sessões por horário
  - Nomes dos palestrantes

- [ ] Implementar layout "compact"
```typescript
  // Layout estilo terminal/minimalista
  // Grid com horários à esquerda
  // Sessões empilhadas
  // Fontes monospace
```

- [ ] Implementar layout "spacious"
```typescript
  // Layout com mais espaçamento
  // Cards maiores para cada sessão
  // Avatares dos palestrantes visíveis
```

- [ ] Criar Server Action para salvar tema
```typescript
  export async function saveTheme(
    eventId: string,
    theme: ThemeConfig
  ) {
    await prisma.event.update({
      where: { id: eventId },
      data: { themeConfig: theme }
    });
  }
```
- [ ] Estudar referência visual (`/docs/lineup-reference.png`)
  - Analisar hierarquia tipográfica
  - Identificar elementos decorativos
  - Mapear espaçamento e proporções
  - Documentar paleta de cores usada

### Critérios de Aceite
- ✅ Preview atualiza ao mudar cores
- ✅ Escolha de fonte reflete no preview
- ✅ Tema salvo no banco (themeConfig JSON)
- ✅ Preview responsivo (mobile/desktop)

**🛑 PARA AQUI - Validar customização visual**

---

## 📤 Task 8: Publicação e Compartilhamento

### Objetivos
- Wizard step 6 (final)
- Publicar evento
- Gerar link público
- Download PNG

### Checklist

- [ ] Criar componente `PublishStep`
  - Preview final do lineup
  - Checklist de requisitos:
    - [ ] Pelo menos 1 palco
    - [ ] Pelo menos 1 sessão
    - [ ] Sem conflitos
  - Botão "Publicar Evento" (disabled se requisitos não atendidos)

- [ ] Criar Server Action para publicar
```typescript
  export async function publishEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autorizado");

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        stages: true,
        sessions: {
          include: {
            speakers: true
          }
        }
      }
    });

    // Validar requisitos
    if (event.stages.length === 0) {
      throw new Error("Adicione pelo menos 1 palco");
    }

    if (event.sessions.length === 0) {
      throw new Error("Adicione pelo menos 1 sessão");
    }

    // Verificar conflitos
    // ... (lógica de validação)

    await prisma.event.update({
      where: { id: eventId },
      data: { isPublished: true }
    });

    return event.slug;
  }
```
- [ ] Validar output final contra referência
  - Comparar proporções
  - Verificar legibilidade em 1024x1024px
  - Testar com diferentes temas
  - Garantir que grid de fundo é sutil (não distrai)

- [ ] Implementar geração de PNG
```typescript
  // src/lib/lineup-generator.ts
  import { toPng } from 'html-to-image';

  export async function generateLineupPNG(
    containerId: string
  ): Promise<Blob> {
    const element = document.getElementById(containerId);
    if (!element) throw new Error("Elemento não encontrado");

    return toPng(element, {
      width: 1024,
      height: 1024,
      pixelRatio: 2,
      backgroundColor: element.style.backgroundColor,
    });
  }
```

- [ ] Criar botão "Baixar PNG"
```typescript
  async function handleDownload() {
    const blob = await generateLineupPNG('lineup-preview');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.slug}-lineup.png`;
    link.click();
    URL.revokeObjectURL(url);
  }
```

- [ ] Criar botão "Copiar Link"
```typescript
  async function handleCopyLink() {
    const url = `${window.location.origin}/lineup/${event.slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }
```

### Critérios de Aceite
- ✅ Evento só publica se passar validações
- ✅ Download gera PNG 1024x1024px
- ✅ Link copiado corretamente
- ✅ Redirect para `/home` após publicação
- ✅ Card do evento na home mostra "Publicado"

**🛑 PARA AQUI - Validar publicação e download**

---

## 🌐 Task 9: Página Pública do LineUp

### Objetivos
- Rota `/lineup/[slug]` acessível sem login
- Visualização readonly
- Botão de download

### Checklist

- [ ] Criar página `/lineup/[slug]/page.tsx`
```typescript
  export async function generateStaticParams() {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      select: { slug: true }
    });

    return events.map(event => ({ slug: event.slug }));
  }

  export default async function LineupPublicPage({
    params
  }: {
    params: { slug: string }
  }) {
    const event = await prisma.event.findUnique({
      where: { slug: params.slug, isPublished: true },
      include: {
        stages: true,
        sessions: {
          include: {
            stage: true,
            speakers: {
              include: { speaker: true }
            }
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });

    if (!event) notFound();

    return <LineupPublicView event={event} />;
  }
```

- [ ] Criar componente `LineupPublicView`
  - Renderiza lineup com tema salvo
  - Botão "Baixar PNG"
  - Footer com "Criado com LineUp System"
  - Sem header de navegação

- [ ] Tratar caso de evento não encontrado
  - Página 404 customizada
  - Sugestão de eventos similares (opcional)

### Critérios de Aceite
- ✅ Página carrega sem login
- ✅ Mostra lineup completo com tema customizado
- ✅ Download funciona
- ✅ 404 para slugs inválidos ou não publicados
- ✅ SEO otimizado (meta tags com nome do evento)

**🛑 PARA AQUI - Validar visualização pública**

---

## ✅ Task 10: Edição de Eventos

### Objetivos
- Permitir editar eventos existentes
- Mesmo wizard, mas com dados pré-preenchidos

### Checklist

- [ ] Criar página `/evento/[id]/editar/page.tsx`
  - Carregar dados do evento
  - Validar ownership (`createdBy`)
  - Mesmo wizard do cadastro
  - Botão "Salvar Alterações" em vez de "Criar"

- [ ] Criar Server Action para atualizar evento
```typescript
  export async function updateEvent(
    eventId: string,
    data: Partial<Event>
  ) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autorizado");

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdBy: true }
    });

    if (event?.createdBy !== session.user.id) {
      throw new Error("Você não tem permissão");
    }

    return prisma.event.update({
      where: { id: eventId },
      data
    });
  }
```

- [ ] Permitir despublicar evento
```typescript
  export async function unpublishEvent(eventId: string) {
    // Validar ownership
    // Atualizar isPublished para false
  }
```

### Critérios de Aceite
- ✅ Apenas dono do evento pode editar
- ✅ Dados pré-preenchidos no wizard
- ✅ Alterações salvas corretamente
- ✅ Pode despublicar evento

**🛑 PARA AQUI - Validar edição de eventos**

---

## 🎯 Task 11: Polimento Final

### Objetivos
- Loading states
- Error boundaries
- Mensagens de feedback
- Responsividade

### Checklist

- [ ] Adicionar Skeleton loaders em todas as páginas
- [ ] Implementar Toast notifications (shadcn/ui Toaster)
- [ ] Error boundaries em rotas principais
- [ ] Validar responsividade mobile (320px, 375px, 768px, 1024px)
- [ ] Adicionar meta tags para SEO
- [ ] Testar com múltiplos navegadores
- [ ] Lighthouse audit (performance, acessibilidade)
- [ ] Corrigir warnings do console

### Critérios de Aceite
- ✅ Sem layout shifts
- ✅ Loading states em todas as ações assíncronas
- ✅ Erros tratados com mensagens amigáveis
- ✅ Score Lighthouse > 90 em todas as categorias
- ✅ Funciona em mobile, tablet, desktop

**🛑 FIM DAS TASKS - Projeto MVP completo! 🎉**

---

## 📊 Resumo de Progresso

- [ ] Task 1: Setup
- [ ] Task 2: Autenticação
- [ ] Task 3: Home
- [ ] Task 4: Cadastro Básico
- [ ] Task 5: Palcos e Palestrantes
- [ ] Task 6: Grade de Sessões
- [ ] Task 7: Customização Visual
- [ ] Task 8: Publicação
- [ ] Task 9: Página Pública
- [ ] Task 10: Edição
- [ ] Task 11: Polimento