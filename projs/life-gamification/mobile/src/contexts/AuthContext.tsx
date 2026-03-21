import React, { createContext, useContext, useState, ReactNode } from 'react';

// Hardcoded para MVP - depois virá de login real
const DEMO_USER_PHONE = '+556286077431';

interface AuthContextType {
  userPhone: string;
  setUserPhone: (phone: string) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userPhone: DEMO_USER_PHONE,
  setUserPhone: () => {},
  isAuthenticated: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userPhone, setUserPhone] = useState(DEMO_USER_PHONE);

  const logout = () => {
    setUserPhone('');
  };

  return (
    <AuthContext.Provider
      value={{
        userPhone,
        setUserPhone,
        isAuthenticated: !!userPhone,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
