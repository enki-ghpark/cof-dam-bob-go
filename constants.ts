
import { Party, User } from './types';

// 초기 사용자는 null로 시작하거나 기본 템플릿만 남김
export const DEFAULT_USER: User = {
  uid: '',
  displayName: '',
  avatarUrl: ''
};

// 모든 예시 데이터를 지우고 빈 배열로 시작
export const INITIAL_PARTIES: Party[] = [];
