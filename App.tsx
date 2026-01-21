
import React, { useState, useEffect } from 'react';
import { INITIAL_PARTIES } from './constants';
import { Party, PartyType, TabItem, PartyStatus, User } from './types';
import { PartyCard } from './components/PartyCard';
import { CreatePartyModal } from './components/CreatePartyModal';
import { PartyDetailModal } from './components/PartyDetailModal';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { Bell, Cigarette, Utensils, List, Plus, Settings, LogOut, Coffee } from 'lucide-react';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as partyService from './services/partyService';

const TABS: TabItem[] = [
  { id: 'ALL', label: '전체', icon: List },
  { id: 'COFFEE', label: '커피', icon: Coffee },
  { id: 'SMOKE', label: '담배', icon: Cigarette },
  { id: 'MEAL', label: '밥', icon: Utensils },
  { id: 'SETTINGS', label: '설정', icon: Settings },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [parties, setParties] = useState<Party[]>(INITIAL_PARTIES);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SMOKE' | 'MEAL' | 'COFFEE' | 'SETTINGS'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    smoke: true,
    meal: true,
    coffee: true
  });
  
  // 알림 설정을 구독 콜백에서 참조하기 위해 ref 사용
  const settingsRef = React.useRef(notificationSettings);
  useEffect(() => {
    settingsRef.current = notificationSettings;
  }, [notificationSettings]);

  const lastSeenPartyIds = React.useRef<Set<string>>(new Set());

  // PWA 설치 프로모트 로직
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // auth 및 실시간 데이터 구독
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'User',
          avatarUrl: firebaseUser.photoURL || '',
          email: firebaseUser.email || ''
        });
      } else {
        setUser(null);
      }
    });

    const unsubscribeParties = partyService.subscribeToParties((updatedParties) => {
      if (lastSeenPartyIds.current.size === 0 && updatedParties.length > 0) {
        updatedParties.forEach(p => lastSeenPartyIds.current.add(p.id));
        setParties(updatedParties);
        return;
      }

      updatedParties.forEach(party => {
        if (!lastSeenPartyIds.current.has(party.id)) {
          lastSeenPartyIds.current.add(party.id);
          
          const isMine = auth.currentUser?.uid === party.creatorId;
          const isRecent = Date.now() - party.createdAt < 60000; 
          
          if (!isMine && isRecent && Notification.permission === 'granted') {
            let shouldNotify = false;
            if (party.type === PartyType.SMOKE) shouldNotify = settingsRef.current.smoke;
            else if (party.type === PartyType.MEAL) shouldNotify = settingsRef.current.meal;
            else if (party.type === PartyType.COFFEE) shouldNotify = settingsRef.current.coffee;

            if (shouldNotify) {
              const title = party.type === PartyType.SMOKE ? '담배 한 대 고?' : 
                           party.type === PartyType.MEAL ? '밥 먹으러 고?' : '커피 한 잔 고?';
              
              const options: NotificationOptions = {
                body: `${party.location}에서 ${party.creatorName}님이 모여요!`,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: party.id,
                requireInteraction: true 
              };

              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(title, options);
                }).catch(() => {
                  new Notification(title, options);
                });
              } else {
                new Notification(title, options);
              }
            }
          }
        }
      });

      setParties(updatedParties);
    });

    const savedSettings = localStorage.getItem('dam-bab-go-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings(parsed);
      } catch (e) {
        // use default
      }
    }

    return () => {
      unsubscribeAuth();
      unsubscribeParties();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('dam-bab-go-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        // Firebase 로그아웃
        await signOut(auth);
        
        // Google One Tap / Login 세션 종료 시도
        if (window.google?.accounts?.id) {
          window.google.accounts.id.disableAutoSelect();
        }
        
        setUser(null);
        setActiveTab('ALL');
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedParty = parties.find(p => p.id === selectedPartyId) || null;

  const filteredParties = parties
    .filter(p => activeTab === 'ALL' || p.type === activeTab || activeTab === 'SETTINGS')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === PartyStatus.OPEN ? -1 : 1;
      return b.createdAt - a.createdAt; // 최신순
    });

  const handleCreateParty = async (data: any) => {
    const newParty: Omit<Party, 'id'> = {
      status: PartyStatus.OPEN,
      creatorId: user.uid,
      creatorName: user.displayName,
      createdAt: Date.now(),
      participants: [user.uid],
      participantNames: { [user.uid]: user.displayName },
      orders: {},
      type: data.type,
      location: data.location,
      meetTime: data.time || Date.now(),
      description: data.description || '',
      voteOptions: data.voteOptions || []
    };
    
    try {
      await partyService.createParty(newParty);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Create party error:", error);
      alert("모집 생성 중 오류가 발생했습니다.");
    }
  };

  const handleJoin = async (partyId: string) => {
    try {
      await partyService.joinParty(partyId, user.uid, user.displayName);
    } catch (error) {
      console.error("Join party error:", error);
    }
  };

  const handleLeave = async (partyId: string) => {
    try {
      await partyService.leaveParty(partyId, user.uid);
      setSelectedPartyId(null);
    } catch (error) {
      console.error("Leave party error:", error);
    }
  };

  const handleCloseParty = async (partyId: string) => {
    try {
      await partyService.closeParty(partyId);
      setSelectedPartyId(null);
    } catch (error) {
      console.error("Close party error:", error);
    }
  };

  const handleVote = async (partyId: string, optionId: string) => {
    if (!selectedParty) return;
    try {
      await partyService.voteOption(partyId, optionId, user.uid, selectedParty);
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleUpdateOrder = async (partyId: string, menu: string) => {
    try {
      await partyService.updateOrder(partyId, user.uid, menu);
    } catch (error) {
      console.error("Update order error:", error);
    }
  };

  const handleAddOption = async (partyId: string, name: string) => {
    try {
      await partyService.addVoteOption(partyId, name);
    } catch (error) {
      console.error("Add option error:", error);
    }
  };

  const requestNotification = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!("Notification" in window)) {
      alert("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }

    if (Notification.permission === 'granted') {
      alert("이미 알림 권한이 허용되어 있습니다.");
      return;
    }

    if (Notification.permission === 'denied') {
      alert("알림 권한이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해 주세요.");
      return;
    }

    Notification.requestPermission().then(permission => {
      if(permission === 'granted') {
        alert("알림이 성공적으로 활성화되었습니다!");
      } else {
        alert("알림 권한이 거부되었습니다.");
      }
    }).catch(err => {
      console.error("Notification permission request error:", err);
      alert("알림 권한 요청 중 오류가 발생했습니다.");
    });
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-gray-50 border-x border-gray-100 relative shadow-2xl">
      
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-5 py-4 flex justify-between items-center border-b border-gray-100">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">커담밥고</h1>
          <p className="text-xs text-gray-500">반가워요, {user.displayName}님</p>
        </div>
        <div className="flex space-x-1">
           <button 
             onClick={requestNotification} 
             className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
             aria-label="알림 설정"
           >
            <Bell size={20} />
          </button>
          <button 
            onClick={handleLogout} 
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
            aria-label="로그아웃"
          >
            <LogOut size={20} />
          </button>
          <div className="w-8 h-8 ml-1 rounded-full overflow-hidden border-2 border-indigo-100 shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                {user.displayName[0]}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 mt-4">
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} className="mb-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        {activeTab === 'SETTINGS' ? (
          <SettingsView 
            notifications={notificationSettings} 
            onToggle={(type) => setNotificationSettings(prev => ({...prev, [type]: !prev[type]}))}
            currentUser={user}
          />
        ) : (
          <div className="animate-fade-in">
            {filteredParties.length === 0 ? (
              <div className="text-center py-24 px-10">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Plus size={40} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">아직 파티가 없어요</h3>
                <p className="text-sm text-gray-400">하단 버튼을 눌러 첫 번째 모집을 시작해 보세요!</p>
              </div>
            ) : (
              filteredParties.map(party => (
                <PartyCard key={party.id} party={party} onClick={(p) => setSelectedPartyId(p.id)} />
              ))
            )}
          </div>
        )}
      </div>

      {activeTab !== 'SETTINGS' && (
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform hover:bg-black"
          style={{ right: 'max(2rem, calc(50% - 224px + 2rem))' }}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}

      {showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-600 text-white p-4 text-sm flex justify-between items-center z-50 max-w-md mx-auto shadow-2xl rounded-t-xl">
          <span className="font-medium">홈 화면에 추가하면 앱처럼 쓸 수 있어요!</span>
          <button onClick={() => setShowInstallBanner(false)} className="p-1 hover:bg-indigo-700 rounded"><X size={18}/></button>
        </div>
      )}

      <CreatePartyModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateParty} 
      />

      <PartyDetailModal 
        party={selectedParty}
        currentUser={user}
        onClose={() => setSelectedPartyId(null)}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onCloseParty={handleCloseParty}
        onVote={handleVote}
        onAddOption={handleAddOption}
        onUpdateOrder={handleUpdateOrder}
      />
    </div>
  );
};

const X = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default App;
