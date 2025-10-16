
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Role } from './types';
import { api } from './services/mockApi';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StressCheckPage from './pages/StressCheckPage';
import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

interface AuthContextType {
  user: User | null;
  login: (loginId: string, pass: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

// FIX: Use React.PropsWithChildren for better type inference with children.
function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (loginId: string, pass: string) => {
    setLoading(true);
    try {
      const loggedInUser = await api.login(loginId, pass);
      if (loggedInUser) {
        setUser(loggedInUser);
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
      }
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    // Navigate to login page after logout
    window.location.href = '#/login';
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div className="h-screen flex items-center justify-center"><Spinner /></div> : children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function MainLayout() {
    const navigate = useNavigate();
    const handleLogoClick = () => {
        navigate('/');
    }
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header onLogoClick={handleLogoClick}/>
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const HomeRedirect = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />

    switch (user.role) {
        case Role.ADMIN:
            return <Navigate to="/admin-dashboard" />;
        case Role.STAFF:
            return <Navigate to="/staff-dashboard" />;
        case Role.USER:
            return <Navigate to="/dashboard" />;
        default:
            return <Navigate to="/login" />;
    }
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/staff-dashboard" element={<StaffDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/stress-check" element={<StressCheckPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}


export default App;