import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MapPin, ShoppingCart, Hospital, Loader2 } from 'lucide-react';

interface MapResult {
  title: string;
  uri: string;
}

const Services: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MapResult[]>([]);
  const [queryType, setQueryType] = useState<'market' | 'hospital' | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [status, setStatus] = useState("请选择服务");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error(err);
        setStatus("请允许定位权限以查找附近服务");
      }
    );
  }, []);

  const searchNearby = async (type: 'market' | 'hospital') => {
    if (!location) {
      alert("正在获取位置，请稍候...");
      return;
    }
    
    setLoading(true);
    setQueryType(type);
    setResults([]);
    setStatus(`正在查找附近的${type === 'market' ? '菜市场' : '医院'}...`);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = type === 'market' 
        ? "Find 5 popular vegetable markets or supermarkets near me." 
        : "Find 5 general hospitals or community clinics near me.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng
              }
            }
          }
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const found: MapResult[] = [];

      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
             found.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
        });
      }
      
      setResults(found);
      setStatus(found.length > 0 ? "找到以下地点：" : "未找到附近地点");

    } catch (e) {
      console.error(e);
      setStatus("搜索失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 mt-4">周边服务</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => searchNearby('market')}
          disabled={loading}
          className="bg-green-100 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-green-200 active:bg-green-200"
        >
           <ShoppingCart size={48} className="text-green-600 mb-2" />
           <span className="text-xl font-bold text-green-800">找菜场</span>
        </button>

        <button 
          onClick={() => searchNearby('hospital')}
          disabled={loading}
          className="bg-red-100 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-red-200 active:bg-red-200"
        >
           <Hospital size={48} className="text-red-600 mb-2" />
           <span className="text-xl font-bold text-red-800">找医院</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm min-h-[300px]">
        <h2 className="text-xl font-bold text-gray-600 mb-4 border-b pb-2">{status}</h2>
        
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        )}

        <div className="space-y-4">
          {results.map((place, idx) => (
             <a 
               key={idx} 
               href={place.uri} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 border border-gray-100 transition-colors"
             >
               <MapPin className="text-orange-500 shrink-0" size={24} />
               <span className="text-lg font-bold text-gray-800 truncate">{place.title}</span>
             </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;