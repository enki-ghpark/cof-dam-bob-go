
import React, { useState } from 'react';
import { Party, PartyType, MealMode, User, PartyStatus } from '../types';
import { X, MapPin, Clock, Users, Check, Plus, Coffee, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PartyDetailModalProps {
  party: Party | null;
  currentUser: User;
  onClose: () => void;
  onJoin: (partyId: string) => void;
  onLeave: (partyId: string) => void;
  onCloseParty: (partyId: string) => void;
  onVote: (partyId: string, optionId: string) => void;
  onAddOption: (partyId: string, optionName: string) => void;
  onUpdateOrder?: (partyId: string, menu: string) => void;
}

export const PartyDetailModal: React.FC<PartyDetailModalProps> = ({
  party,
  currentUser,
  onClose,
  onJoin,
  onLeave,
  onCloseParty,
  onVote,
  onAddOption,
  onUpdateOrder
}) => {
  const [newOptionName, setNewOptionName] = useState('');
  const [myMenu, setMyMenu] = useState('');
  
  if (!party) return null;

  const isJoined = party.participants.includes(currentUser.uid);
  const isCreator = party.creatorId === currentUser.uid;
  const isMeal = party.type === PartyType.MEAL;
  const isSmoke = party.type === PartyType.SMOKE;
  const isCoffee = party.type === PartyType.COFFEE;
  const isVoteMode = isMeal && party.mealMode === MealMode.VOTE;
  const isClosed = party.status === PartyStatus.CLOSED;

  const chartData = party.voteOptions?.map(opt => ({
    name: opt.name,
    votes: opt.votes.length,
    id: opt.id,
    isMyVote: opt.votes.includes(currentUser.uid)
  })) || [];

  const handleUpdateMyMenu = () => {
    if (onUpdateOrder && myMenu) {
      onUpdateOrder(party.id, myMenu);
      setMyMenu('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-start p-5 pb-2">
          <div>
            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold mb-2 ${
              isSmoke ? 'bg-gray-100 text-gray-700' : 
              isMeal ? 'bg-orange-100 text-orange-700' : 
              'bg-amber-100 text-amber-800'
            }`}>
              {isSmoke ? '담배 타임' : isMeal ? '밥 타임' : '커피 타임'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
               {isMeal && party.mealMode === MealMode.FIXED ? party.fixedMenu : 
                (isSmoke ? '담배 한 대 피러 가실 분?' : isCoffee ? '시원한 커피 한 잔 할까요?' : '점심 메뉴 투표해 주세요')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">모집자: {party.creatorName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto no-scrollbar space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <Clock size={12} className="mr-1" /> 만남 시간
              </div>
              <div className="font-semibold text-gray-800">
                {new Date(party.meetTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <MapPin size={12} className="mr-1" /> 장소
              </div>
              <div className="font-semibold text-gray-800 truncate">
                {party.location}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center text-gray-500 text-xs mb-2 uppercase font-bold tracking-wider">
              <Users size={12} className="mr-1" /> 참여 중인 사람 ({party.participants.length}명)
            </div>
            <div className="flex flex-wrap gap-2">
              {party.participants.map(uid => {
                const name = party.participantNames?.[uid] || '익명';
                const order = party.orders?.[uid];
                const tooltipText = order ? `${name}: ${order}` : name;
                
                return (
                  <div 
                    key={uid} 
                    className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold border-2 border-white shadow-sm relative group cursor-help transition-transform hover:scale-110" 
                    title={tooltipText}
                  >
                    {uid === currentUser.uid ? '나' : name[0]}
                    {order && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white"></div>
                    )}
                    {/* 커스텀 툴팁 (optional, browser default title used above for simplicity) */}
                  </div>
                );
              })}
              {!isJoined && !isClosed && (
                <button onClick={() => onJoin(party.id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 border-2 border-dashed border-gray-300">
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          {isCoffee && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <h3 className="flex items-center font-bold text-amber-900 mb-3 text-sm">
                <ShoppingBag size={16} className="mr-1" /> 주문 메뉴 목록
              </h3>
              
              <div className="space-y-2 mb-4">
                {party.participants.length > 0 ? (
                  party.participants.map(uid => (
                    <div key={uid} className="flex justify-between items-center text-sm py-1 border-b border-amber-100/50 last:border-0">
                      <span className="text-gray-500">{party.participantNames?.[uid] || (uid === currentUser.uid ? '나' : '익명')}</span>
                      <span className="font-bold text-gray-800">
                        {party.orders?.[uid] || <span className="text-gray-300 italic font-normal">미정</span>}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-amber-600 italic">아직 참여자가 없습니다.</p>
                )}
              </div>

              {!isClosed && isJoined && (
                <div className="flex gap-2 mt-2">
                  <input 
                    className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-gray-900 placeholder-gray-400"
                    placeholder="원하는 커피 메뉴 입력..."
                    value={myMenu}
                    onChange={(e) => setMyMenu(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateMyMenu()}
                  />
                  <button 
                    disabled={!myMenu}
                    onClick={handleUpdateMyMenu}
                    className="bg-amber-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 font-bold"
                  >
                    확정
                  </button>
                </div>
              )}
            </div>
          )}

          {isVoteMode && (
            <div className="border-t pt-4">
              <h3 className="font-bold text-gray-800 mb-3">투표 결과</h3>
              <div className="h-40 w-full mb-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#374151'}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isMyVote ? '#6366f1' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>

              {!isClosed && isJoined && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-1">메뉴를 선택해 주세요:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {party.voteOptions?.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => onVote(party.id, opt.id)}
                        className={`text-sm py-2 px-3 rounded-lg border transition-all flex justify-between items-center ${
                          opt.votes.includes(currentUser.uid) 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{opt.name}</span>
                        {opt.votes.includes(currentUser.uid) && <Check size={14} />}
                      </button>
                    ))}
                  </div>

                  {party.allowAddOption && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-dashed">
                      <input 
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                        placeholder="새 메뉴 추가..."
                        value={newOptionName}
                        onChange={(e) => setNewOptionName(e.target.value)}
                      />
                      <button 
                        disabled={!newOptionName}
                        onClick={() => {
                          onAddOption(party.id, newOptionName);
                          setNewOptionName('');
                        }}
                        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 font-bold"
                      >
                        추가
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          {!isClosed ? (
             isJoined ? (
              <>
                {isCreator && (
                  <button 
                    onClick={() => onCloseParty(party.id)}
                    className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold active:scale-95 transition-transform"
                  >
                    모집 마감하기
                  </button>
                )}
                <button 
                  onClick={() => onLeave(party.id)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  나가기
                </button>
              </>
            ) : (
              <button 
                onClick={() => onJoin(party.id)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
              >
                참여하기
              </button>
            )
          ) : (
            <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">
              마감된 파티입니다
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
