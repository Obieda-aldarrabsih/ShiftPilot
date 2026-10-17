import { create } from 'zustand';

interface AuthState {
  token: string | null;
  role: string | null;
  userId: string | null;
  companyId: string | null;
  login: (token: string, role: string, userId: string, companyId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  userId: localStorage.getItem('userId'),
  companyId: localStorage.getItem('companyId'),
  
  login: (token, role, userId, companyId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('companyId', companyId);
    set({ token, role, userId, companyId });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('companyId');
    set({ token: null, role: null, userId: null, companyId: null });
  },
}));
