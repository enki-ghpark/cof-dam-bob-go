
import React, { useState } from 'react';
import { PartyType, MealMode } from '../types';
import { Cigarette, Utensils, Sparkles, X, MapPin, Clock, Coffee } from 'lucide-react';
import { getMenuRecommendation } from '../services/geminiService';

interface CreatePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export const CreatePartyModal: React.FC<CreatePartyModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [type, setType] = useState<PartyType>(PartyType.SMOKE);
  const [location, setLocation] = useState('');
  const [timeMode, setTimeMode] = useState<'now' | '5min' | '10min' | 'custom'>('5min');
  const [customTime, setCustomTime] = useState('');
  
  const [mealMode, setMealMode] = useState<MealMode>(MealMode.VOTE);
  const [fixedMenu, setFixedMenu] = useState('');
  const [voteOptions, setVoteOptions] = useState<string[]>(['한식', '일식', '양식']);
  const [newOption, setNewOption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    const now = Date.now();
    let meetTime = now;

    if (timeMode === 'now') meetTime = now;
    else if (timeMode === '5min') meetTime = now + 5 * 60 * 1000;
    else if (timeMode === '10min') meetTime = now + 10 * 60 * 1000;
    else if (timeMode === 'custom' && customTime) {
      const [hours, minutes] = customTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      if (date.getTime() < now) {
        date.setDate(date.getDate() + 1);
      }
      meetTime = date.getTime();
    }

    const payload: any = {
      type,
      location: location || (type === PartyType.SMOKE ? '흡연장' : type === PartyType.COFFEE ? '사내 카페' : '로비'),
      meetTime,
    };

    if (type === PartyType.MEAL) {
      payload.mealMode = mealMode;
      if (mealMode === MealMode.FIXED) {
        payload.fixedMenu = fixedMenu || '점심 식사';
      } else {
        payload.voteOptions = voteOptions.map((name, idx) => ({ 
          id: `opt_${Date.now()}_${idx}`, 
          name, 
          votes: [] 
        }));
        payload.allowAddOption = true;
      }
    }

    onCreate(payload);
    setLocation('');
    onClose();
  };

  const handleAIRecommend = async () => {
    setIsGenerating(true);
    const suggestions = await getMenuRecommendation('직장인 점심', '맑음');
    if (suggestions.length > 0) {
      if (mealMode === MealMode.FIXED) {
        setFixedMenu(suggestions[0]);
      } else {
        setVoteOptions([...voteOptions, ...suggestions.slice(0, 3)]);
      }
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">새 파티 만들기</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto no-scrollbar">
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button 
              onClick={() => setType(PartyType.COFFEE)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                type === PartyType.COFFEE ? 'border-amber-700 bg-amber-50 text-amber-800' : 'border-gray-100 text-gray-400'
              }`}
            >
              <Coffee size={24} />
              <span className="mt-1 font-bold text-xs">커피 ㄱ</span>
            </button>
            <button 
              onClick={() => setType(PartyType.SMOKE)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                type === PartyType.SMOKE ? 'border-gray-800 bg-gray-50 text-gray-800' : 'border-gray-100 text-gray-400'
              }`}
            >
              <Cigarette size={24} />
              <span className="mt-1 font-bold text-xs">담배 ㄱ</span>
            </button>
            <button 
              onClick={() => setType(PartyType.MEAL)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                type === PartyType.MEAL ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'
              }`}
            >
              <Utensils size={24} />
              <span className="mt-1 font-bold text-xs">밥 ㄱ</span>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <Clock size={16} className="mr-1" /> 언제 모일까요?
            </label>
            <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'now', label: '지금 바로' },
                { id: '5min', label: '5분 뒤' },
                { id: '10min', label: '10분 뒤' },
                { id: 'custom', label: '직접 선택' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimeMode(opt.id as any)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                    timeMode === opt.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {timeMode === 'custom' && (
              <input
                type="time"
                className="mt-3 block w-full rounded-lg border-gray-300 bg-white border p-2.5 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
              <MapPin size={16} className="mr-1" /> 장소가 어디인가요?
            </label>
            <input
              type="text"
              placeholder={type === PartyType.COFFEE ? "예: 사내 카페" : type === PartyType.SMOKE ? "예: 옥상" : "예: 1층 로비"}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 placeholder-gray-400 font-medium"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {type === PartyType.MEAL && (
            <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex rounded-lg bg-orange-200/50 p-1 mb-4">
                <button
                  onClick={() => setMealMode(MealMode.VOTE)}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                    mealMode === MealMode.VOTE ? 'bg-white shadow text-orange-600' : 'text-orange-700'
                  }`}
                >
                  투표 모집
                </button>
                <button
                  onClick={() => setMealMode(MealMode.FIXED)}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${
                    mealMode === MealMode.FIXED ? 'bg-white shadow text-orange-600' : 'text-orange-700'
                  }`}
                >
                  메뉴 지정
                </button>
              </div>

              {mealMode === MealMode.FIXED ? (
                <div>
                   <label className="text-xs font-bold text-orange-800 mb-1 block">메뉴 이름</label>
                   <div className="flex gap-2">
                      <input 
                        className="flex-1 p-2 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 font-medium" 
                        placeholder="예: 돈가스"
                        value={fixedMenu}
                        onChange={(e) => setFixedMenu(e.target.value)}
                      />
                      <button 
                        onClick={handleAIRecommend}
                        disabled={isGenerating}
                        className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg disabled:opacity-50"
                        title="AI 메뉴 추천"
                      >
                        <Sparkles size={18} className={isGenerating ? "animate-spin" : ""} />
                      </button>
                   </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-orange-800">투표 후보</label>
                    <button 
                      onClick={handleAIRecommend} 
                      disabled={isGenerating}
                      className="text-xs flex items-center text-indigo-600 font-bold"
                    >
                      <Sparkles size={12} className="mr-1" /> 
                      {isGenerating ? '추천 중...' : 'AI 메뉴 추천'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {voteOptions.map((opt, i) => (
                      <div key={i} className="flex justify-between bg-white p-2 rounded border border-orange-100 text-sm">
                        <span className="text-gray-800 font-bold">{opt}</span>
                        <button onClick={() => setVoteOptions(voteOptions.filter((_, idx) => idx !== i))} className="text-red-400">
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input 
                        className="flex-1 p-2 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 font-medium" 
                        placeholder="후보 추가..."
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newOption) {
                            setVoteOptions([...voteOptions, newOption]);
                            setNewOption('');
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newOption) {
                            setVoteOptions([...voteOptions, newOption]);
                            setNewOption('');
                          }
                        }}
                        className="bg-orange-500 text-white px-3 rounded-lg text-sm font-bold"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button 
            onClick={handleCreate}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            모집 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
