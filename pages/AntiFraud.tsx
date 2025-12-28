import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const AntiFraud: React.FC = () => {
  const [tip, setTip] = useState<string>("正在获取最新防诈骗知识...");
  const [loading, setLoading] = useState(true);

  const fetchTip = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "给老年人讲一条简短的防电信诈骗知识，语言要通俗易懂，大白话，不超过100字。包含一个具体的诈骗场景（如'假冒孙子'或'保健品'）。",
      });
      setTip(response.text || "暂无内容");
    } catch (e) {
      setTip("网络连接失败，请检查网络。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <div className="pb-24 min-h-screen bg-orange-50 p-4">
       <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg mb-6 mt-4">
         <div className="flex items-center gap-3 mb-2">
           <ShieldAlert size={40} />
           <h1 className="text-3xl font-bold">防诈骗知识</h1>
         </div>
         <p className="opacity-90">提高警惕，保护财产安全</p>
       </div>

       <div className="bg-white rounded-3xl p-8 shadow-md border-t-4 border-orange-500 relative">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">今日提醒</h2>
          <p className="text-2xl leading-relaxed text-gray-700 font-medium">
             {loading ? "加载中..." : tip}
          </p>
          
          <div className="mt-8 flex justify-center">
             <button 
               onClick={fetchTip}
               disabled={loading}
               className="flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-lg font-bold active:bg-orange-200"
             >
                <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                换一条
             </button>
          </div>
       </div>

       <div className="mt-6 p-4">
         <h3 className="text-xl font-bold text-gray-600 mb-3">常用紧急电话</h3>
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100" onClick={() => window.open('tel:110')}>
               <p className="text-red-500 font-bold text-3xl mb-1">110</p>
               <p className="text-gray-500">报警电话</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-100" onClick={() => window.open('tel:96110')}>
               <p className="text-blue-500 font-bold text-3xl mb-1">96110</p>
               <p className="text-gray-500">反诈中心</p>
            </div>
         </div>
       </div>
    </div>
  );
};

export default AntiFraud;