import React, { useState } from 'react';
import { Submission } from '../types';
import { Calendar, Search, ArrowRight, Clock, Trash2, Award, Filter } from 'lucide-react';

interface HistoryViewProps {
  submissions: Submission[];
  onSelect: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ submissions, onSelect, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter for only graded submissions and apply search
  const historyItems = submissions
    .filter(s => s.status === 'success' || s.status === 'error') // Show graded or attempted
    .filter(s => s.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.uploadedAt - a.uploadedAt);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (historyItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700">Chưa có lịch sử chấm bài</h3>
        <p className="mt-2 max-w-md">
          Các bài toán sau khi được chấm điểm sẽ xuất hiện tại đây để bạn có thể xem lại bất cứ lúc nào.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-600" />
              Lịch sử bài làm
            </h2>
            <p className="text-gray-500 mt-1">Đã lưu {historyItems.length} bài kiểm tra</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài làm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
            >
              {/* Card Header & Image */}
              <div className="h-40 bg-gray-100 relative overflow-hidden border-b border-gray-100">
                <img 
                  src={item.imageUrl} 
                  alt={item.fileName} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-2 right-2 flex gap-1">
                   <button 
                    onClick={(e) => onDelete(e, item.id)}
                    className="p-1.5 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                    title="Xóa"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                {item.result && (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-white/50">
                    <span className={`text-sm font-bold ${
                      item.result.score >= 8 ? 'text-green-600' : 
                      item.result.score >= 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.result.score} điểm
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-brand-600 transition-colors" title={item.fileName}>
                    {item.fileName}
                  </h3>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.uploadedAt)}
                </div>

                {item.result ? (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {item.result.summary}
                  </p>
                ) : (
                  <p className="text-sm text-red-500 mb-4 flex-1 italic">
                     Bài làm bị lỗi xử lý
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-brand-600">
                  <span className="text-sm font-medium group-hover:underline">Xem chi tiết</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};