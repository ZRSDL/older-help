import React, { useState } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Phone, User, Users, Search, PlusCircle, Bell } from 'lucide-react';
import { Contact, Reminder } from '../types';

const mockData = [
  { name: '0', steps: 100 },
  { name: '20', steps: 400 },
  { name: '40', steps: 300 },
  { name: '60', steps: 800 },
  { name: '80', steps: 200 },
  { name: '20', steps: 100 },
];

const Home: React.FC = () => {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: '儿子', phone: '13800000001', avatarColor: 'bg-blue-200' },
    { id: '2', name: '女儿', phone: '13800000002', avatarColor: 'bg-pink-200' },
    { id: '3', name: '老伴', phone: '13800000003', avatarColor: 'bg-purple-200' },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: '降压药', time: '08:00', active: true },
    { id: '2', title: '散步', time: '18:00', active: true },
  ]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="pb-24 bg-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-orange-500 pt-12 pb-6 px-4 text-white rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button className="p-1"><span className="text-2xl font-bold">&lt;</span></button>
            <h1 className="text-2xl font-bold">夕阳红老年助手</h1>
          </div>
          <div className="flex gap-3">
             <div className="w-8 h-4 rounded-full border-2 border-white flex items-center justify-center text-xs">...</div>
             <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">O</div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Health Card */}
        <div className="bg-gradient-to-br from-orange-200 to-orange-50 rounded-2xl p-4 shadow-md border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">健康卡片</h2>
          <div className="bg-white/60 rounded-xl p-4">
             <div className="text-center mb-4">
                <p className="text-lg font-bold text-gray-700">今日步数</p>
                <p className="text-4xl font-extrabold text-orange-600 my-1">6,432</p>
                <div className="flex justify-between px-8 text-sm text-gray-500 font-bold">
                    <span>步率</span>
                    <span className="text-red-500">心率</span>
                </div>
             </div>
             <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={mockData}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                   <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                     {mockData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === 3 ? '#ef4444' : '#fb923c'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Family Contact */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800">家人联系</h2>
             <span className="text-gray-400 text-2xl">&gt;</span>
           </div>
           
           <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center" onClick={() => handleCall('110')}>
                 <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center border-2 border-orange-500 mb-2">
                    <User className="text-orange-600" size={28} />
                 </div>
                 <span className="font-bold text-gray-700">家人</span>
                 <div className="h-1 w-8 bg-orange-500 rounded-full mt-1"></div>
              </div>

              <div className="flex flex-col items-center">
                 <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 mb-2">
                    <Phone className="text-gray-600" size={28} />
                 </div>
                 <span className="font-bold text-gray-500">联系</span>
              </div>

              <div className="flex flex-col items-center">
                 <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 mb-2">
                    <Users className="text-gray-600" size={28} />
                 </div>
                 <span className="font-bold text-gray-500">快捷拨号</span>
              </div>

              <div className="flex flex-col items-center">
                 <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-200 mb-2">
                    <Search className="text-gray-600" size={28} />
                 </div>
                 <span className="font-bold text-gray-500">搜索</span>
              </div>
           </div>
        </div>

        {/* Quick Call List */}
        <div className="space-y-3">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full ${contact.avatarColor} flex items-center justify-center text-xl font-bold text-gray-700`}>
                   {contact.name[0]}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-gray-800">{contact.name}</h3>
                   <p className="text-gray-500">{contact.phone}</p>
                 </div>
               </div>
               <button 
                 onClick={() => handleCall(contact.phone)}
                 className="bg-green-500 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
               >
                 <Phone size={24} fill="white" />
               </button>
            </div>
          ))}
        </div>

        {/* Reminders */}
         <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bell className="text-orange-500" /> 吃药提醒
              </h2>
              <PlusCircle className="text-orange-500" size={28} />
            </div>
            {reminders.map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-800">{r.time}</span>
                    <span className="text-lg text-gray-600">{r.title}</span>
                 </div>
                 <button 
                    onClick={() => toggleReminder(r.id)}
                    className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors ${r.active ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
                 >
                    <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                 </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Home;