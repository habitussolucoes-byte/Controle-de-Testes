
// Types for the application components

export interface Client {
    id: string;
    name: string;
    phone: string;
    createdAt: number;
    status: 'pending' | 'called';
    calledAt?: number;
}

export interface AppSettings {
    whatsappMessage: string;
}
