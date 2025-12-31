
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
  const hoursWaiting = (currentTime - client.createdAt) / (1000 * 60 * 60);
  const isCritical = client.status === 'pending' && hoursWaiting >= 2;
  
  const timeStr = new Date(client.createdAt).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const waLink = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    settings.whatsappMessage.replace('{nome}', client.name)
  )}`;

  return (
    <div className={`bg-white border p-5 rounded-[28px] transition-all duration-300 relative overflow-hidden animate-in ${
      isCritical ? 'border-red-500 bg-red-50 shadow-xl shadow-red-100' : 'border-slate-100 shadow-sm'
    }`}>
      {isCritical && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
          Alerta 2h+
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className={`font-black text-lg leading-tight ${isCritical ? 'text-red-900' : 'text-slate-800'}`}>
            {client.name}
          </h4>
          <p className="text-xs font-bold text-slate-400 mt-0.5">{client.phone}</p>
        </div>
        <div className="bg-slate-50 px-2.5 py-1 rounded-xl text-[10px] font-black text-slate-500 border border-slate-100">
          {timeStr}
        </div>
      </div>

      <div className="flex gap-2">
        {client.status === 'pending' ? (
          <button 
            onClick={onCall}
            className={`flex-1 text-white text-[10px] font-black py-3.5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg ${
              isCritical ? 'bg-red-600 shadow-red-200' : 'bg-indigo-600 shadow-indigo-100'
            }`}
          >
            Já Chamei
          </button>
        ) : (
          <button 
            onClick={onDelete}
            className="flex-1 bg-emerald-600 text-white text-[10px] font-black py-3.5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-100"
          >
            Assinou (Remover)
          </button>
        )}
        
        <a 
          href={waLink} 
          target="_blank" 
          rel="noreferrer"
          className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ClientCard;
