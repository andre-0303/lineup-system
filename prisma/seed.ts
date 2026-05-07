import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '../generated/prisma';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { hash } from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no .env');
}

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'admin@lineup.com',
      password: await hash('123456', 10),
      name: 'Admin Teste'
    }
  });

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
