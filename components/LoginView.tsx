import React, { useEffect } from 'react';
import { Cigarette, Utensils, Coffee } from 'lucide-react';
import { GoogleAuthProvider, signInWithCredential, signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebase';

// Fix for TypeScript error: Added global declaration to resolve 'Property google does not exist on type Window' errors
declare global {
  interface Window {
    google: any;
  }
}

interface LoginViewProps {
  onLoginSuccess: (userData: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  useEffect(() => {
    /* global google */
    const handleCredentialResponse = async (response: any) => {
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        const result = await signInWithCredential(auth, credential);
        const user = result.user;
        
        onLoginSuccess({
          uid: user.uid,
          displayName: user.displayName || 'User',
          avatarUrl: user.photoURL || '',
          email: user.email || ''
        });
      } catch (error) {
        console.error("Firebase auth error:", error);
        alert("로그인 중 오류가 발생했습니다.");
      }
    };

    // Fix: Explicitly checking window.google which is now typed via the global declaration above
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%", text: "signin_with" }
      );
    }
  }, [onLoginSuccess]);

  // 데모/테스트를 위한 익명 로그인 기능
  const simulateLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      
      onLoginSuccess({
        uid: user.uid,
        displayName: `GUEST_${user.uid.slice(0, 4)}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        email: 'anonymous@guest.com'
      });
    } catch (error) {
      console.error("Anonymous login error:", error);
      alert("익명 로그인 중 오류가 발생했습니다. Firebase Console에서 익명 로그인이 활성화되어 있는지 확인해 주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 animate-fade-in">
      <div className="mb-12 text-center">
        <div className="flex justify-center space-x-2 mb-6">
          <div className="p-4 bg-amber-700 text-white rounded-2xl shadow-lg">
            <Coffee size={32} />
          </div>
          <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg">
            <Cigarette size={32} />
          </div>
          <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg">
            <Utensils size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">커담밥고</h1>
        <p className="text-gray-500 font-medium">직장 동료와 함께하는 가장 빠른 약속</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div id="googleBtn" className="w-full"></div>
        
        <p className="text-xs text-center text-gray-400 mt-8 leading-relaxed">
          로그인 시 서비스 이용약관 및 <br/> 개인정보 처리방침에 동의하게 됩니다.
        </p>

        {/* 개발용 임시 버튼 (Client ID 설정 전 확인용) */}
        <button 
          onClick={simulateLogin}
          className="w-full py-3 text-sm font-semibold text-gray-400 border border-gray-100 rounded-xl mt-12 hover:bg-gray-50 transition-colors"
        >
          게스트 계정으로 시작하기 (테스트용)
        </button>
      </div>
    </div>
  );
};
