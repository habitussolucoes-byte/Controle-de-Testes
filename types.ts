
export type ClientStatus = 'pending' | 'called';

export interface Client {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  status: ClientStatus;
  calledAt?: number;
}

export interface AppSettings {
  whatsappMessage: string;
}
