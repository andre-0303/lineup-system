export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  logoUrl?: string;
  fontFamily: 'monospace' | 'sans-serif' | 'serif';
  layout: 'compact' | 'spacious';
  scheduleSize?: 'small' | 'medium' | 'large';
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export type SessionType = 'talk' | 'workshop' | 'panel' | 'break' | 'keynote';

export type SpeakerRole = 'speaker' | 'moderator' | 'panelist';

export type { Event, Stage, Speaker, Session, SessionSpeaker, User } from '../../generated/prisma';

import type { Event, Stage, Speaker, Session, SessionSpeaker } from '../../generated/prisma';

export interface EventWithRelations extends Event {
  stages: Stage[];
  sessions: (Session & {
    stage: Stage;
    speakers: (SessionSpeaker & {
      speaker: Speaker;
    })[];
  })[];
}
