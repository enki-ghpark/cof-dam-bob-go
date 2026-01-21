
import React from 'react';
import { LogOut, Bell, Coffee, Utensils, Cigarette } from 'lucide-react';
import { User } from '../types';

interface SettingsViewProps {
  notifications: { smoke: boolean; meal: boolean; coffee: boolean };
  onToggle: (type: 'smoke' | 'meal' | 'coffee') => void;
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ notifications, onToggle, currentUser }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">내 계정</h3>
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 overflow-hidden">
             {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="profile" className="w-full h-full object-cover" />
            ) : (
              currentUser.displayName[0]
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900">{currentUser.displayName}</div>
            <div className="text-xs text-gray-500">구글 계정으로 로그인됨</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">알림 설정</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg mr-3 text-amber-700">
              <Coffee size={20} />
            </div>
            <div>
              <div className="font-medium text-gray-900">커피 타임 알림</div>
              <div className="text-xs text-gray-500">새로운 커피 파티가 생기면 알림 받기</div>
            </div>
          </div>
          <button 
            onClick={() => onToggle('coffee')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              notifications.coffee ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <div 
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                notifications.coffee ? 'translate-x-6' : 'translate-x-0'
              }`} 
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-3 text-gray-600">
              <Cigarette size={20} />
            </div>
            <div>
              <div className="font-medium text-gray-900">담배 타임 알림</div>
              <div className="text-xs text-gray-500">새로운 담배 파티가 생기면 알림 받기</div>
            </div>
          </div>
          <button 
            onClick={() => onToggle('smoke')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              notifications.smoke ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <div 
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                notifications.smoke ? 'translate-x-6' : 'translate-x-0'
              }`} 
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3 text-orange-600">
              <Utensils size={20} />
            </div>
            <div>
              <div className="font-medium text-gray-900">밥 타임 알림</div>
              <div className="text-xs text-gray-500">새로운 식사 파티가 생기면 알림 받기</div>
            </div>
          </div>
          <button 
            onClick={() => onToggle('meal')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              notifications.meal ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <div 
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                notifications.meal ? 'translate-x-6' : 'translate-x-0'
              }`} 
            />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8">
         커담밥고 v1.0.0
      </div>
    </div>
  );
};
