/**
 * Contexto de autenticação do recrutador.
 * Gerencia estado de login, carregamento e dados do recrutador logado.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getRecruiterToken,
  getRecruiterInfo,
  setRecruiterToken,
  setRecruiterInfo,
  clearRecruiterSession,
  type RecruiterInfo,
} from "./recruiter-auth";

type RecruiterAuthState = {
  recruiter: RecruiterInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, info: RecruiterInfo) => Promise<void>;
  logout: () => Promise<void>;
};

const RecruiterContext = createContext<RecruiterAuthState>({
  recruiter: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function RecruiterProvider({ children }: { children: React.ReactNode }) {
  const [recruiter, setRecruiter] = useState<RecruiterInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega sessão persistida ao iniciar o app
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedInfo] = await Promise.all([
          getRecruiterToken(),
          getRecruiterInfo(),
        ]);
        if (savedToken && savedInfo) {
          setToken(savedToken);
          setRecruiter(savedInfo);
        }
      } catch {
        // Sessão inválida ou expirada — ignora
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (newToken: string, info: RecruiterInfo) => {
      await Promise.all([
        setRecruiterToken(newToken),
        setRecruiterInfo(info),
      ]);
      setToken(newToken);
      setRecruiter(info);
    },
    []
  );

  const logout = useCallback(async () => {
    await clearRecruiterSession();
    setToken(null);
    setRecruiter(null);
  }, []);

  return (
    <RecruiterContext.Provider
      value={{
        recruiter,
        token,
        isAuthenticated: !!token && !!recruiter,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  return useContext(RecruiterContext);
}
