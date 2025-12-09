import React, { useRef, useState } from 'react';
import { GradingResult } from '../types';
import { Check, X, Star, Activity, PenTool, Calculator, BrainCircuit, Lightbulb, Download, Loader2, Award, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import html2canvas from 'html2canvas';

// CSS import removed, handled in index.html for compatibility

interface GradingViewProps {
  result: GradingResult;
}

const MathMarkdown = ({ content, className = "" }: { content: string, className?: string }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <span className="inline-block">{children}</span>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = "text-green-700 border-green-600 bg-white";
  let label = "ĐẠT YÊU CẦU";
  let stampColor = "border-green-600 text-green-600";
  
  if (score < 5) {
      colorClass = "text-red-700 border-red-600 bg-white";
      label = "CHƯA ĐẠT";
      stampColor = "border-red-600 text-red-600";
  } else if (score < 8) {
      colorClass = "text-yellow-700 border-yellow-600 bg-white";
      label = "KHÁ";
      stampColor = "border-yellow-600 text-yellow-600";
  } else if (score >= 9) {
      label = "XUẤT SẮC";
      colorClass = "text-red-600 border-red-600 bg-white"; // Điểm cao cho màu đỏ giống con dấu
      stampColor = "border-red-600 text-red-600";
  } else {
      label = "TỐT";
  }

  return (
    <div className={`relative flex flex-col items-center justify-center w-32 h-32 rounded-full border-[6px] border-double ${stampColor} shadow-sm transform rotate-[-12deg] bg-white/90 backdrop-blur-sm`}>
      <span className="text-5xl font-black tracking-tighter font-display">{score}</span>
      <span className="text-xs font-black uppercase tracking-widest mt-0 border-t-2 border-current pt-1 pb-1 px-2">{label}</span>
      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-100 shadow-sm">
          {score === 10 && <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" />}
          {score < 10 && score >= 8 && <Award className="w-8 h-8 text-blue-500 fill-blue-100" />}
      </div>
    </div>
  );
};

export const GradingView: React.FC<GradingViewProps> = ({ result }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    try {
      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(exportRef.current, {
        scale: 4, // Ultra high resolution for sharp text
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: exportRef.current.scrollWidth,
        height: exportRef.current.scrollHeight,
        onclone: (documentClone) => {
            // You can modify styles specifically for the export here if needed
            const element = documentClone.getElementById('export-container');
            if (element) {
                element.style.padding = '40px';
                element.style.borderRadius = '0';
                element.style.boxShadow = 'none';
            }
        }
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Phieu_Cham_Bai_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Không thể xuất ảnh. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-full pb-20">
      
      {/* Action Bar */}
      <div className="flex justify-end mb-6 px-2 sticky top-0 z-20 pt-2 pb-2 bg-white/80 backdrop-blur-sm">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Lưu phiếu chấm (Ảnh HD)
        </button>
      </div>

      {/* Printable Area Wrapper */}
      <div className="overflow-x-auto pb-4">
        <div 
            ref={exportRef} 
            id="export-container"
            className="min-w-[800px] w-full max-w-[1000px] mx-auto bg-white p-8 sm:p-12 rounded-none relative overflow-hidden"
            style={{
                boxShadow: "0 0 40px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb"
            }}
        >
            {/* Document Decorative Border (Simulating Certificate/Official Doc) */}
            <div className="absolute inset-4 border-4 border-double border-brand-200 pointer-events-none z-10 rounded-lg"></div>
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 select-none overflow-hidden">
                 <div className="transform -rotate-45 text-9xl font-black text-brand-900 whitespace-nowrap">
                     TOÁN THẦY MẠNH
                 </div>
            </div>

            {/* Header Section */}
            <div className="relative z-20 flex justify-between items-start border-b-2 border-brand-800 pb-6 mb-8 mx-4 mt-2">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-brand-900 font-display uppercase tracking-widest leading-none mb-2">
                        Phiếu Kết Quả
                    </h1>
                    <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                        <span className="bg-brand-100 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Môn Toán</span>
                        <span>•</span>
                        <span>APP HỖ TRỢ CHẤM BÀI MÔN TOÁN</span>
                    </div>
                </div>
                <div className="text-right">
                     <div className="text-sm font-bold text-gray-600 mb-1">Ngày chấm</div>
                     <div className="text-lg font-display text-gray-900 font-bold">
                        {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                     </div>
                     <div className="text-xs text-brand-600 font-mono mt-1">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                </div>
            </div>

            {/* Summary & Score Section */}
            <div className="relative z-20 flex items-stretch gap-8 mb-10 mx-4">
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-6 relative">
                    <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-200 transform scale-x-[-1]" />
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pl-10 font-display uppercase tracking-wider border-b border-gray-200 pb-2 inline-block">
                        Nhận xét tổng quan
                    </h2>
                    <div className="text-gray-800 text-base leading-relaxed text-justify font-serif pl-2">
                         <MathMarkdown content={result.summary} />
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center px-4">
                    <ScoreBadge score={result.score} />
                </div>
            </div>

            {/* Problem Statement */}
            <div className="relative z-20 mb-10 mx-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-brand-600 text-white p-1.5 rounded-lg shadow-sm">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-900 uppercase tracking-wide font-display">
                        Đề bài nhận diện
                    </h3>
                </div>
                <div className="bg-white border-l-4 border-brand-500 pl-6 py-3 pr-4 shadow-sm">
                    <div className="text-gray-900 font-medium text-lg leading-relaxed font-serif">
                        <MathMarkdown content={result.problemStatement} />
                    </div>
                </div>
            </div>

            {/* Step by Step Analysis */}
            <div className="relative z-20 mb-10 mx-4">
                 <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
                    <div className="bg-gray-800 text-white p-1.5 rounded-lg shadow-sm">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide font-display">
                        Chi tiết các bước giải
                    </h3>
                </div>

                <div className="space-y-6">
                    {result.steps.map((step, idx) => (
                    <div 
                        key={idx} 
                        className={`relative rounded-xl border-2 p-5 ${
                        step.isCorrect 
                            ? 'bg-white border-gray-100' 
                            : 'bg-red-50/30 border-red-100'
                        }`}
                    >
                        <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 border rounded text-xs font-bold uppercase tracking-wider text-gray-500 shadow-sm">
                             Bước {step.stepNumber}
                        </div>
                        
                        <div className="flex gap-4">
                             <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                 step.isCorrect 
                                     ? 'bg-green-50 text-green-600 border-green-200' 
                                     : 'bg-red-50 text-red-600 border-red-200'
                             }`}>
                                {step.isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                             </div>

                             <div className="flex-1">
                                <div className="text-gray-900 font-bold text-lg mb-2 font-display">
                                    <MathMarkdown content={step.content} />
                                </div>
                                <div className={`text-base font-serif italic ${step.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                    <span className="font-bold not-italic mr-1">Nhận xét:</span>
                                    <MathMarkdown content={step.feedback} />
                                </div>
                                
                                {!step.isCorrect && step.correction && (
                                    <div className="mt-3 pt-3 border-t border-red-100">
                                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1 uppercase tracking-wider">
                                            <PenTool className="w-3 h-3" /> Sửa lại đúng
                                        </div>
                                        <div className="text-gray-900 bg-white p-3 rounded border border-red-100 shadow-sm font-medium">
                                            <MathMarkdown content={step.correction} />
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            {/* Competencies */}
            <div className="relative z-20 mb-10 mx-4 grid grid-cols-3 gap-4">
                 <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Tư duy Logic</div>
                      <div className="text-sm text-center font-medium text-gray-800"><MathMarkdown content={result.competencies.logic} /></div>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Tính toán</div>
                      <div className="text-sm text-center font-medium text-gray-800"><MathMarkdown content={result.competencies.calculation} /></div>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Trình bày</div>
                      <div className="text-sm text-center font-medium text-gray-800"><MathMarkdown content={result.competencies.presentation} /></div>
                 </div>
            </div>

            {/* Correct Solution Box */}
            {result.score < 10 && (
                <div className="relative z-20 mx-4 mb-8 bg-gray-50 border border-gray-300 rounded-xl overflow-hidden print:bg-gray-100">
                    <div className="bg-gray-800 text-white px-6 py-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold uppercase tracking-wider text-sm">Lời giải tham khảo</span>
                    </div>
                    <div className="p-6 text-gray-800 font-serif text-base leading-loose">
                         <MathMarkdown content={result.correctSolution} />
                    </div>
                </div>
            )}

            {/* Footer Information */}
            <div className="relative z-20 mt-12 pt-6 border-t-2 border-brand-800 mx-4 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className="font-bold text-brand-900 uppercase tracking-widest text-sm">LÊ ĐỨC MẠNH</div>
                    <div className="text-sm text-gray-600 font-medium">Zalo: 0973 852 062</div>
                    <div className="text-xs text-gray-400 mt-1">Hệ thống chấm bài toán tự động</div>
                </div>
                
                <div className="text-right">
                    <div className="inline-block border-2 border-red-600 text-red-600 px-3 py-1 font-black text-xs uppercase tracking-widest transform -rotate-6 opacity-80 rounded mask-grunge">
                        ĐÃ CHẤM / VERIFIED
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};