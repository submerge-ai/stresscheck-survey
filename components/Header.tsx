import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { api } from '../services/mockApi';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const { user, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  // This effect will refetch the logo when the component mounts or when the user changes.
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await api.getAiSettings();
      setLogoUrl(settings.logoUrl);
    };
    fetchSettings();
  }, [user]);


  return (
    <header className="bg-white shadow-md no-print">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center h-16">
        <button onClick={onLogoClick} className="cursor-pointer">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-10 max-w-xs" />
          ) : (
            <h1 className="text-2xl font-bold text-brand-dark">
              AI Stress Check
            </h1>
          )}
        </button>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 hidden sm:block">こんにちは, {user?.name}さん</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-brand-base text-white rounded-full hover:bg-brand-dark transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;