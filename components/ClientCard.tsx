
import React from 'react';
import { Client, AppSettings } from '../types';

interface ClientCardProps {
  client: Client;
  currentTime: number;
  settings: AppSettings;
  onCall: () => void;
  onDelete: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, currentTime, settings, onCall, onDelete }) => {
  const diffHours = (currentTime - client.createdAt) / (1000 * 60 * 60);
  const isOverdue = client.status === 'pending' && diffHours >= 2;

  const timeString = new Date(client.createdAt).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const durationText = () => {
    const minutes = Math.floor((currentTime - client.createdAt) / 60000);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min atrás`;
  };

  const getWhatsAppLink = () => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const message = settings.whatsappMessage.replace('{nome}', client.name);
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={`group relative bg-white border rounded-2xl p-4 transition-all duration-300 ${
      isOverdue 
        ? 'border-red-400 bg-red-50/50 shadow-lg shadow-red-100' 
        : 'border-slate-100 shadow-sm hover:shadow-md'
    }`}>
      {isOverdue && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md z-10 animate-bounce">
          ALERTA 2H+
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={`font-bold text-base tracking-tight ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
            {client.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
              {client.phone}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
            isOverdue ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-500'
          }`}>
            {timeString}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{durationText()}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-dashed border-slate-100 flex gap-2">
        {client.status === 'pending' ? (
          <button
            onClick={onCall}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 ${
              isOverdue ? 'bg-red-600 shadow-red-200' : 'bg-indigo-600 shadow-indigo-100'
            } shadow-lg`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            JÁ CHAMEI
          </button>
        ) : (
          <button
            onClick={onDelete}
            className="flex-1 py-2.5 bg-emerald-600 shadow-lg shadow-emerald-100 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            MARCAR COMO ASSINOU
          </button>
        )}
        
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-600 w-11 h-11 flex items-center justify-center rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ClientCard;
