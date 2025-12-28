import React from 'react';
import { Home, Mic, MapPin, BookOpen } from 'lucide-react';
import { Tab } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (path: string): Tab => {
    if (path.includes('voice')) return Tab.VOICE;
    if (path.includes('services')) return Tab.SERVICES;
    if (path.includes('education')) return Tab.EDUCATION;
    return Tab.HOME;
  };

  const currentTab = getTabFromPath(location.pathname);

  const navItemClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center w-full py-2 ${
      isActive ? 'text-orange-600' : 'text-gray-400'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-20 flex justify-around items-center z-50 max-w-[480px] mx-auto shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      <button onClick={() => navigate('/')} className={navItemClass(currentTab === Tab.HOME)}>
        <Home size={32} strokeWidth={2.5} />
        <span className="text-sm font-bold mt-1">首页</span>
      </button>
      
      <button onClick={() => navigate('/voice')} className={navItemClass(currentTab === Tab.VOICE)}>
        <div className={`p-2 rounded-full ${currentTab === Tab.VOICE ? 'bg-orange-100' : ''}`}>
           <Mic size={32} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold mt-1">语音助手</span>
      </button>

      <button onClick={() => navigate('/services')} className={navItemClass(currentTab === Tab.SERVICES)}>
        <MapPin size={32} strokeWidth={2.5} />
        <span className="text-sm font-bold mt-1">周边服务</span>
      </button>

      <button onClick={() => navigate('/education')} className={navItemClass(currentTab === Tab.EDUCATION)}>
        <BookOpen size={32} strokeWidth={2.5} />
        <span className="text-sm font-bold mt-1">防诈骗</span>
      </button>
    </div>
  );
};

export default Navigation;