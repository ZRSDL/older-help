export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  active: boolean;
}

export enum Tab {
  HOME = 'home',
  VOICE = 'voice',
  SERVICES = 'services',
  EDUCATION = 'education'
}
