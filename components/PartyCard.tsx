
import React from 'react';
import { Party, PartyType, PartyStatus, MealMode } from '../types';
import { Cigarette, Utensils, Clock, MapPin, Users, Coffee } from 'lucide-react';

interface PartyCardProps {
  party: Party;
  onClick: (party: Party) => void;
}

export const PartyCard: React.FC<PartyCardProps> = ({ party, onClick }) => {
  const isSmoke = party.type === PartyType.SMOKE;
  const isMeal = party.type === PartyType.MEAL;
  const isCoffee = party.type === PartyType.COFFEE;
  const isClosed = party.status === PartyStatus.CLOSED;

  const timeDiff = party.meetTime - Date.now();
  const minutesLeft = Math.ceil(timeDiff / (1000 * 60));
  let timeDisplay = '';
  
  if (isClosed) {
    timeDisplay = '모집 마감';
  } else if (minutesLeft < 0) {
    timeDisplay = '진행 중';
  } else if (minutesLeft === 0) {
    timeDisplay = '지금 바로';
  } else {
    timeDisplay = `${minutesLeft}분 남음`;
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      onClick={() => onClick(party)}
      className={`relative mb-3 rounded-xl p-4 shadow-sm border transition-all active:scale-[0.98] cursor-pointer
        ${isClosed ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-white border-gray-100 hover:border-indigo-200'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${
            isSmoke ? 'bg-gray-100 text-gray-600' : 
            isMeal ? 'bg-orange-100 text-orange-600' : 
            'bg-amber-100 text-amber-700'
          }`}>
            {isSmoke ? <Cigarette size={20} /> : isMeal ? <Utensils size={20} /> : <Coffee size={20} />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {isSmoke ? '담배 한 대' : 
               isCoffee ? '커피 한 잔' :
               (party.mealMode === MealMode.VOTE ? '메뉴 투표 중' : party.fixedMenu || '식사 파티')}
            </h3>
            <span className="text-xs text-gray-500">{party.creatorName}</span>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          isClosed ? 'bg-gray-200 text-gray-500' : 
          minutesLeft <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
        }`}>
          {timeDisplay}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        <div className="flex space-x-3">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            {formatTime(party.meetTime)}
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            {party.location}
          </div>
        </div>
        <div className="flex items-center text-indigo-600 font-medium">
          <Users size={14} className="mr-1" />
          {party.participants.length}명 참여 중
        </div>
      </div>
    </div>
  );
};
