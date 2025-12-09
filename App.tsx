import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, RotateCcw, Plus, Trash2, FileText, ChevronRight, History as HistoryIcon, LayoutGrid, Sigma, Pi, Calculator, Binary, SquareFunction, Sparkles, GraduationCap, GripVertical, RotateCw, FolderInput } from 'lucide-react';
import { analyzeMathProblem } from './services/geminiService';
import { GradingResult, Submission } from './types';
import { GradingView } from './components/GradingView';
import { HistoryView } from './components/HistoryView';

const App: React.FC = () => {
  // App State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGradingAll, setIsGradingAll] = useState(false);
  const [viewMode, setViewMode] = useState<'workspace' | 'history'>('workspace');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Resizable State
  const [leftPanelWidth, setLeftPanelWidth] = useState(40); // Default image width 40%, Result 60%
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('math_app_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubmissions(parsed);
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('math_app_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.warn("Storage quota exceeded. Could not save history.", e);
    }
  }, [submissions, isLoaded]);

  // Auto-select logic for initial load only
  useEffect(() => {
    if (viewMode === 'workspace' && submissions.length > 0 && !selectedId) {
      setSelectedId(submissions[submissions.length - 1].id);
    }
  }, [submissions.length, selectedId, viewMode]);

  // Resizing Logic
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      // Limit min/max width (20% to 80%)
      if (newLeftWidth > 20 && newLeftWidth < 80) {
        setLeftPanelWidth(newLeftWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);


  const processFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert("Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, ...)");
        return;
    }

    const newSubmissions: Submission[] = [];
    let processedCount = 0;
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          let fileName = file.name;
          if (fileName === 'image.png') {
            fileName = `Bai_lam_${new Date().toLocaleTimeString('vi-VN').replace(/:/g, '-')}.png`;
          }

          newSubmissions.push({
            id: Math.random().toString(36).substr(2, 9),
            fileName: fileName,
            imageUrl: e.target.result as string,
            status: 'idle',
            result: null,
            errorMessage: null,
            uploadedAt: Date.now(),
            rotation: 0
          });
        }
        processedCount++;
        if (processedCount === imageFiles.length) {
          setSubmissions(prev => [...prev, ...newSubmissions]);
          setViewMode('workspace'); 
          // Automatically select the last item from the newly added batch
          if (newSubmissions.length > 0) {
            setSelectedId(newSubmissions[newSubmissions.length - 1].id);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and Drop Handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  }, [processFiles]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [processFiles]);

  const gradeSubmission = async (id: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'grading', errorMessage: null } : s));

    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    try {
      const base64Data = submission.imageUrl.split(',')[1];
      const data = await analyzeMathProblem(base64Data);
      
      setSubmissions(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'success', result: data } : s
      ));
    } catch (err) {
      setSubmissions(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'error', errorMessage: "Không thể chấm bài. Vui lòng thử lại." } : s
      ));
      console.error(err);
    }
  };

  const gradeAllPending = async () => {
    setIsGradingAll(true);
    const pending = submissions.filter(s => s.status === 'idle' || s.status === 'error');
    for (const sub of pending) {
      await gradeSubmission(sub.id);
    }
    setIsGradingAll(false);
  };

  const deleteSubmission = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleRotate = (id: string) => {
    setSubmissions(prev => prev.map(s => 
      s.id === id ? { ...s, rotation: (s.rotation || 0) + 90 } : s
    ));
  };

  const resetAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.")) {
      setSubmissions([]);
      setSelectedId(null);
      localStorage.removeItem('math_app_submissions');
    }
  };

  const handleHistorySelect = (id: string) => {
    setSelectedId(id);
    setViewMode('workspace');
  };

  const selectedSubmission = submissions.find(s => s.id === selectedId);

  // --- MAIN APP ---
  return (
    <div 
        className={`min-h-screen flex flex-col items-center bg-graph-paper h-screen overflow-hidden text-gray-800 ${isResizing ? 'cursor-col-resize select-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-brand-500/10 backdrop-blur-sm border-4 border-dashed border-brand-500 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce border border-brand-100">
            <div className="p-4 bg-brand-100 rounded-full mb-4">
                <FolderInput className="w-16 h-16 text-brand-600" />
            </div>
            <span className="text-2xl font-black text-brand-700 tracking-tight font-display">Thả hình ảnh vào đây</span>
            <span className="text-gray-500 mt-2">Thêm ngay vào danh sách chấm bài</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 px-4 md:px-8 flex items-center justify-between flex-shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewMode('workspace')}>
          <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl shadow-lg shadow-brand-500/20 text-white transform group-hover:scale-105 transition-transform duration-300">
            <Sigma className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight leading-none font-display">
              Toán <span className="text-brand-600">Thầy Mạnh</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
              <Calculator className="w-3.5 h-3.5 text-brand-400" />
              <span>Chấm bài tự động chuẩn CT 2018</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 md:gap-3 items-center">
          {/* View Mode Toggles */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl mr-2 border border-gray-200">
            <button
              onClick={() => setViewMode('workspace')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === 'workspace' 
                  ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Chấm bài</span>
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === 'history' 
                  ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          <button 
            onClick={resetAll}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Xóa tất cả dữ liệu"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-brand-300 text-gray-700 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm bài</span>
          </button>

          {submissions.some(s => s.status === 'idle' || s.status === 'error') && (
            <button
              onClick={gradeAllPending}
              disabled={isGradingAll}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2"
            >
              {isGradingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="hidden sm:inline">Chấm tất cả</span>
              <span className="sm:hidden">Chấm</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto flex flex-col md:flex-row overflow-hidden relative">
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*"
          multiple
        />

        {viewMode === 'history' ? (
          <HistoryView 
            submissions={submissions} 
            onSelect={handleHistorySelect}
            onDelete={deleteSubmission}
          />
        ) : (
          /* WORKSPACE VIEW */
          <>
            {/* Empty State with Math Theme */}
            {submissions.length === 0 && (
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer relative flex flex-col items-center justify-center w-full max-w-xl h-80 border-2 border-dashed border-brand-200 rounded-3xl bg-white/60 hover:bg-white hover:border-brand-400 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  {/* Decorative Icons */}
                  <Pi className="absolute top-8 left-8 w-12 h-12 text-brand-100 rotate-[-15deg] group-hover:text-brand-200 transition-colors" />
                  <Binary className="absolute bottom-8 right-8 w-12 h-12 text-brand-100 rotate-[15deg] group-hover:text-brand-200 transition-colors" />
                  <SquareFunction className="absolute top-8 right-8 w-8 h-8 text-brand-100 group-hover:text-brand-200 transition-colors" />
                  <div className="absolute bottom-10 left-10 w-6 h-6 rounded-full border-2 border-brand-100"></div>

                  <div className="p-5 bg-gradient-to-br from-brand-50 to-white rounded-full mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ring-4 ring-brand-50">
                    <Upload className="w-12 h-12 text-brand-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2 font-display">Tải bài làm lên</h3>
                  <p className="text-gray-500 text-center px-4 max-w-sm mb-6">
                    Hỗ trợ chấm bài tự luận, trắc nghiệm. <br/>
                    <span className="text-brand-500 font-medium">Kéo thả</span> hoặc <span className="text-brand-500 font-medium">Dán ảnh (Ctrl+V)</span> trực tiếp
                  </p>
                  
                  <div className="flex gap-4 opacity-60">
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      <FileText className="w-3 h-3" /> JPG, PNG
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar / List (Visible if submissions exist) */}
            {submissions.length > 0 && (
              <div className="w-full md:w-60 lg:w-64 bg-white/90 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-200 flex flex-col flex-shrink-0 z-10 h-[140px] md:h-full shadow-lg md:shadow-none">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Bài làm ({submissions.length})
                  </span>
                </div>
                
                <div className="flex-1 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto p-2 md:p-3 flex md:flex-col gap-2 custom-scrollbar">
                  {submissions.map((sub) => (
                    <div 
                      key={sub.id}
                      onClick={() => setSelectedId(sub.id)}
                      className={`relative group flex-shrink-0 w-36 md:w-full cursor-pointer rounded-xl border transition-all duration-200 p-2 md:p-3 flex flex-col md:flex-row gap-3 items-center md:items-start ${
                        selectedId === sub.id 
                          ? 'bg-brand-50/80 border-brand-200 shadow-sm ring-1 ring-brand-200' 
                          : 'bg-white border-gray-100 hover:border-brand-200 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-full md:w-12 h-24 md:h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-200 group-hover:border-brand-100 transition-colors">
                        <img src={sub.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center transition-opacity">
                          {sub.status === 'success' && <div className="bg-green-500 text-white rounded-full p-1 shadow-sm"><CheckCircle className="w-3 h-3" /></div>}
                          {sub.status === 'error' && <div className="bg-red-500 text-white rounded-full p-1 shadow-sm"><AlertCircle className="w-3 h-3" /></div>}
                          {sub.status === 'grading' && <div className="bg-white/90 text-brand-600 rounded-full p-1 shadow-sm"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col flex-1 min-w-0 py-0.5">
                        <p className="text-sm font-semibold text-gray-800 truncate" title={sub.fileName}>{sub.fileName}</p>
                        <div className="flex items-center gap-1 mt-auto">
                          {sub.status === 'success' ? (
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-200">
                              {sub.result?.score} điểm
                            </span>
                          ) : (
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                              sub.status === 'grading' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                              sub.status === 'error' ? 'text-red-600 bg-red-50 border-red-100' :
                              'text-gray-500 bg-gray-100 border-gray-200'
                            }`}>
                              {sub.status === 'grading' ? 'Xử lý' : 
                                sub.status === 'error' ? 'Lỗi' : 'Chờ chấm'}
                            </span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={(e) => deleteSubmission(e, sub.id)}
                        className="absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-white hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full md:opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workspace Area */}
            {selectedSubmission ? (
              <div 
                ref={containerRef}
                className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white/50 backdrop-blur-sm relative"
              >
                
                {/* Left Panel: Image Viewer (Resizable) */}
                <div 
                  className="w-full md:h-full flex flex-col border-b md:border-b-0 border-gray-200 h-[40vh] relative flex-shrink-0"
                  style={{ width: window.innerWidth >= 768 ? `${leftPanelWidth}%` : '100%' }}
                >
                  <div className="absolute inset-0 bg-graph-paper opacity-50 pointer-events-none"></div>
                  
                  <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 relative">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 truncate text-sm md:text-base flex-1 min-w-0 mr-2">
                      <div className="p-1 bg-brand-100 text-brand-600 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate">{selectedSubmission.fileName}</span>
                    </h3>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleRotate(selectedSubmission.id)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-gray-200 hover:border-brand-200"
                            title="Xoay hình ảnh"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                        
                        {selectedSubmission.status !== 'grading' && !selectedSubmission.result && (
                        <button
                            onClick={() => gradeSubmission(selectedSubmission.id)}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 hover:shadow-md whitespace-nowrap"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Chấm ngay
                        </button>
                        )}
                        {selectedSubmission.status === 'success' && (
                            <button
                                onClick={() => gradeSubmission(selectedSubmission.id)}
                                className="text-xs bg-white border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                                <RotateCcw className="w-3 h-3" /> Chấm lại
                            </button>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex-1 relative overflow-hidden p-4 flex items-center justify-center z-0 bg-gray-100/50">
                    <img 
                      src={selectedSubmission.imageUrl} 
                      alt="Current submission" 
                      style={{ 
                          transform: `rotate(${selectedSubmission.rotation || 0}deg)`,
                          transition: 'transform 0.3s ease-in-out'
                      }}
                      className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border-4 border-white"
                    />
                  </div>
                </div>

                {/* Drag Handle (Desktop Only) */}
                <div
                  className="hidden md:flex w-2 bg-gray-100 border-l border-r border-gray-200 cursor-col-resize items-center justify-center hover:bg-brand-100 hover:border-brand-200 transition-colors z-20"
                  onMouseDown={startResizing}
                >
                  <GripVertical className="w-3 h-3 text-gray-400" />
                </div>

                {/* Right Panel: Grading Results (Resizable) */}
                <div 
                  className="w-full flex flex-col h-[60vh] md:h-full bg-white relative flex-shrink-0"
                  style={{ width: window.innerWidth >= 768 ? `calc(${100 - leftPanelWidth}% - 8px)` : '100%' }}
                >
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    {selectedSubmission.status === 'idle' && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-50">
                          <GraduationCap className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="font-medium text-lg text-gray-600">Bài làm sẵn sàng để chấm</p>
                        <p className="text-sm mt-1 mb-6">Nhấn nút bên dưới để bắt đầu phân tích</p>
                        <button 
                          onClick={() => gradeSubmission(selectedSubmission.id)}
                          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2 hover:-translate-y-0.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          Chấm bài này
                        </button>
                      </div>
                    )}

                    {selectedSubmission.status === 'grading' && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-brand-200 rounded-full animate-ping opacity-25"></div>
                            <div className="relative bg-white p-4 rounded-full shadow-xl border border-brand-100">
                                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-brand-600 animate-spin" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Đang phân tích bài giải...</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                          Hệ thống đang kiểm tra logic, tính toán và trình bày theo chuẩn CT GDPT 2018.
                        </p>
                      </div>
                    )}

                    {selectedSubmission.status === 'error' && (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="bg-red-50 p-6 rounded-full mb-4 ring-8 ring-red-50/50">
                          <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Đã xảy ra lỗi</h3>
                        <p className="text-gray-500 mt-2 mb-6 max-w-xs mx-auto">{selectedSubmission.errorMessage}</p>
                        <button 
                          onClick={() => gradeSubmission(selectedSubmission.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all shadow-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Thử lại ngay
                        </button>
                      </div>
                    )}

                    {selectedSubmission.status === 'success' && selectedSubmission.result && (
                      <GradingView result={selectedSubmission.result} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              submissions.length > 0 && (
                <div className="hidden md:flex flex-1 items-center justify-center bg-graph-paper text-gray-400 flex-col">
                    <div className="p-8 bg-white/80 backdrop-blur rounded-3xl shadow-sm border border-white flex flex-col items-center max-w-sm text-center">
                        <div className="bg-brand-50 p-4 rounded-2xl mb-4">
                            <ChevronRight className="w-8 h-8 text-brand-500" />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Chọn bài làm</h3>
                        <p className="text-gray-500">Chọn một bài làm từ danh sách bên trái để xem chi tiết kết quả.</p>
                    </div>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;