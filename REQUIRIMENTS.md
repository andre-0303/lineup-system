# LineUp System - Requirements

## Visão Geral
Sistema gerador de lineups para eventos de tecnologia, onde organizadores criam eventos com programação detalhada e geram outputs visuais customizáveis. O público pode visualizar os lineups através de links públicos ou imagens compartilháveis.

## Personas

### Admin/Organizador
- Cria e gerencia eventos
- Monta grade de programação
- Cadastra palestrantes e sessões
- Gera lineup visual customizável
- Compartilha link público

### Usuário Final (Público)
- Visualiza lineup através de link público
- Baixa imagem PNG do lineup
- Não precisa de cadastro/login

---

## Funcionalidades

### F1: Autenticação
- Cadastro com email e senha
- Login com email e senha
- Logout
- Sessão persistente

### F2: Cadastro de Evento
- Admin cria evento com dados básicos (nome, descrição, datas, local)
- Suporte para eventos multi-dia
- Suporte para múltiplos palcos/salas
- Evento salvo como rascunho até finalização

### F3: Gerenciamento de Palcos
- Adicionar/remover palcos do evento
- Definir nome e capacidade do palco
- Ordenar palcos para visualização

### F4: Gerenciamento de Palestrantes
- Cadastrar palestrantes com dados básicos (nome, bio, empresa, cargo)
- Upload de avatar
- Links para redes sociais (opcional)
- Reutilizar palestrantes em múltiplos eventos

### F5: Montagem de Grade Horária
- Criar sessões com título, descrição, tipo e horário
- Associar sessão a um palco
- Vincular palestrantes à sessão
- Tipos de sessão: Talk, Workshop, Panel, Break, Keynote

### F6: Detecção de Conflitos
- Validar conflitos de horário para palestrantes
- Alertar quando mesmo palestrante estiver em sessões simultâneas
- Bloquear finalização se houver conflitos pendentes

### F7: Geração de Lineup Visual
- Ao terminar de cadastrar o evento e a grade, é possível gerar o LineUp customizável
- **Estilo visual**: Minimalista tech/terminal inspirado em festivais de música eletrônica
- **Referência**: Ver `/docs/lineup-reference.png`
- **Elementos obrigatórios**:
  - Nome do evento (topo)
  - Data em destaque (centro, tipografia grande)
  - Grade de horários completa (inferior)
  - Localização e URL (rodapé)
  - Grid de fundo sutil
  - Elementos geométricos decorativos (triângulos, barras)
- **Resolução fixa**: 1024x1024px (PNG)

### F8: Download e Compartilhamento
- Download do lineup como PNG (1024x1024px)
- Gerar link público compartilhável
- Link público acessível sem login
- Visualização readonly do lineup

### F9: Dashboard de Eventos
- Listar eventos criados pelo usuário
- Cards com preview do lineup
- Ações rápidas: editar, baixar, copiar link, excluir

---

## Regras de Negócio

### RN1: Autenticação
- Apenas usuários autenticados podem criar eventos
- Apenas usuários autenticados podem acessar o dashboard
- Rotas públicas: login, cadastro, visualização de lineup

### RN2: Validação de Evento
- Evento só pode ser publicado se atender:
  - Ter pelo menos 1 palco cadastrado
  - Ter pelo menos 1 sessão cadastrada
  - Todas as sessões devem ter horário definido (start_time < end_time)
  - Não haver conflitos de horário entre palestrantes
  - Evento com `is_published = false` não gera link público

### RN3: Conflitos de Horário
- Palestrante não pode estar em duas sessões simultâneas no mesmo evento
- Sistema deve validar overlaps usando função `check_speaker_conflict()`
- Conflitos devem ser exibidos em tempo real ao montar grade

### RN4: Download de Lineup
- Resolução fixa: 1024x1024px (PNG)
- Apenas eventos publicados podem ter lineup baixado
- Preview disponível antes da publicação

### RN5: Link Público
- Formato: `/lineup/[slug-do-evento]`
- Slug deve ser único e URL-friendly
- Apenas eventos com `is_published = true` são acessíveis
- Links de eventos não publicados retornam 404

### RN6: Propriedade de Evento
- Usuário só pode editar/excluir eventos criados por ele
- Campo `created_by` define dono do evento

---

## O que o Sistema NÃO Faz (v1)

- ❌ Cadastro de shows/festivais de música
- ❌ Gestão de ingressos/vendas
- ❌ Gestão de cachês/pagamentos
- ❌ Controle de presença/check-in
- ❌ Rider técnico
- ❌ Múltiplos temas salvos por evento (apenas 1 theme_config)
- ❌ Colaboração multi-usuário no mesmo evento
- ❌ Exportação em PDF (apenas PNG)
- ❌ Integração com calendários externos

---

## Requisitos Não-Funcionais

### RNF1: Performance
- Geração de lineup no client-side (Canvas API ou biblioteca)
- Sem necessidade de API para renderizar imagem
- Índices de banco para queries de sessions e stages

### RNF2: Responsividade
- Mobile-First (320px+)
- Tablet (768px+)
- Desktop (1024px+)

### RNF3: Acessibilidade
- Contraste mínimo WCAG AA
- Navegação por teclado
- Labels em formulários

### RNF4: Idioma
- Textos em português brasileiro (pt-BR)
- Formatação de datas em pt-BR

### RNF5: Segurança
- Senhas hasheadas com bcrypt
- Proteção contra SQL Injection (Prisma)
- Validação de inputs (Zod)
- CSRF protection (NextAuth)

### RNF6: UX
- Dark mode como padrão
- Feedback visual em ações (loading states)
- Mensagens de erro claras
- Confirmação antes de excluir dados

---

## Métricas de Sucesso (Futuro)

- Tempo médio para criar um evento completo < 15 minutos
- Taxa de eventos publicados vs rascunhos > 70%
- Taxa de downloads de lineup > 80% dos eventos publicados
- Zero conflitos de horário em eventos publicados