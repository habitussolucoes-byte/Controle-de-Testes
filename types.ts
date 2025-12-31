
// Fix: Restaurando interfaces para que o arquivo seja reconhecido como um módulo TypeScript válido
export interface Client {
  id: number;
  name: string;
  phone: string;
  createdAt: number;
  status: 'pending' | 'called';
}

export interface AppSettings {
  whatsappMessage: string;
}
