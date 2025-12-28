import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import VoiceAssistant from './pages/VoiceAssistant';
import Services from './pages/Services';
import AntiFraud from './pages/AntiFraud';

const App: React.FC = () => {
  // Check for API Key availability at the top level
  if (!process.env.API_KEY) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">配置错误</h1>
          <p>未检测到 API KEY。请确保环境变量中包含 API_KEY。</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voice" element={<VoiceAssistant />} />
          <Route path="/services" element={<Services />} />
          <Route path="/education" element={<AntiFraud />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;