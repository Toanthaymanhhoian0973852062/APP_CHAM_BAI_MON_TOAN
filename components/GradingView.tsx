import React, { useRef, useState } from 'react';
import { GradingResult } from '../types';
import { Check, X, Star, Activity, PenTool, Calculator, BrainCircuit, Lightbulb, Download, Loader2 } from 'lucide-react';
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
  let colorClass = "text-green-600 border-green-600 bg-green-50";
  let label = "ĐẠT YÊU CẦU";
  
  if (score < 5) {
      colorClass = "text-red-600 border-red-600 bg-red-50";
      label = "CHƯA ĐẠT";
  } else if (score < 8) {
      colorClass = "text-yellow-600 border-yellow-600 bg-yellow-50";
      label = "KHÁ";
  } else if (score >= 9) {
      label = "XUẤT SẮC";
  } else {
      label = "TỐT";
  }

  return (
    <div className={`relative flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[6px] border-double ${colorClass} shadow-xl transform rotate-[-10deg] hover:rotate-0 transition-transform duration-300 bg-white`}>
      <span className="text-3xl sm:text-4xl font-black tracking-tighter">{score}</span>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1 border-t border-current pt-1">{label}</span>
      <div className="absolute -top-1 -right-1">
          {score === 10 && <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-md animate-pulse" />}
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
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200 // Force desktop width for consistency
      });

      const image = canvas.toDataURL("image/png");
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
    <div className="w-full max-w-full pb-10">
      
      {/* Action Bar */}
      <div className="flex justify-end mb-4 px-2">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:text-brand-600 hover:border-brand-500 rounded-xl font-bold text-sm shadow-sm transition-all hover:shadow-md"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Xuất Phiếu Chấm (Ảnh)
        </button>
      </div>

      {/* Printable Area */}
      <div ref={exportRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Header for Image Export */}
        <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900 font-display uppercase tracking-widest">Phiếu Kết Quả</h1>
                <p className="text-gray-500 text-sm font-medium">APP HỖ TRỢ CHẤM BÀI MÔN TOÁN - Zalo: 0973 852 062</p>
            </div>
            <div className="text-right text-xs text-gray-400 font-mono">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        {/* Header Summary */}
        <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="w-full text-center sm:text-left pt-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3 tracking-tight font-display">Tổng quan bài làm</h2>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed text-sm sm:text-base italic relative text-justify">
              <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-gray-400 uppercase tracking-wider border border-gray-100 rounded-md">Nhận xét chung</span>
              <MathMarkdown content={`"${result.summary}"`} />
            </div>
          </div>
          <div className="flex-shrink-0 mb-2 sm:mb-0">
            <ScoreBadge score={result.score} />
          </div>
        </div>

        {/* Problem Statement */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-24 h-24 text-blue-500" />
          </div>
          <h4 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
              <Activity className="w-4 h-4" />
              Đề bài nhận diện
          </h4>
          <div className="text-blue-900 font-medium text-sm sm:text-lg leading-relaxed break-words relative z-10 font-display">
              <MathMarkdown content={result.problemStatement} />
          </div>
        </div>

        {/* Step by Step Analysis */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <Activity className="w-5 h-5" />
            </div>
            Chi tiết các bước giải
          </h3>
          <div className="space-y-4 relative">
              {/* Connecting line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

            {result.steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`relative z-10 p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${
                  step.isCorrect 
                      ? 'bg-white border-green-200 hover:border-green-300' 
                      : 'bg-red-50/50 border-red-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 border-2 shadow-sm ${
                      step.isCorrect 
                          ? 'bg-green-100 text-green-600 border-green-200' 
                          : 'bg-red-100 text-red-600 border-red-200'
                  }`}>
                    {step.isCorrect ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <X className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-500 text-xs sm:text-sm uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">Bước {step.stepNumber}</span>
                    </div>
                    <div className="text-gray-900 font-bold text-base sm:text-lg mb-3 break-words font-display">
                      <MathMarkdown content={step.content} />
                    </div>
                    
                    <div className={`text-sm ${step.isCorrect ? 'text-green-700' : 'text-red-700'} break-words flex items-start gap-2`}>
                      <span className="mt-1.5 block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current opacity-60"></span>
                      <div className="flex-1">
                        <MathMarkdown content={step.feedback} />
                      </div>
                    </div>

                    {!step.isCorrect && step.correction && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-red-100 text-sm text-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-red-600 mb-2 text-xs uppercase tracking-wider">
                          <PenTool className="w-3 h-3" />
                          Sửa lại cho đúng
                        </div>
                        <div className="break-words font-medium">
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

        {/* Competency Assessment (CT 2018) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-purple-700 font-bold text-base">
              <div className="p-2 bg-purple-100 rounded-lg"><BrainCircuit className="w-5 h-5" /></div>
              Tư duy Logic
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <MathMarkdown content={result.competencies.logic} />
            </p>
          </div>
          <div className="p-5 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-orange-700 font-bold text-base">
              <div className="p-2 bg-orange-100 rounded-lg"><Calculator className="w-5 h-5" /></div>
              Tính toán
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <MathMarkdown content={result.competencies.calculation} />
            </p>
          </div>
          <div className="p-5 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-teal-700 font-bold text-base">
              <div className="p-2 bg-teal-100 rounded-lg"><PenTool className="w-5 h-5" /></div>
              Trình bày
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <MathMarkdown content={result.competencies.presentation} />
            </p>
          </div>
        </div>

        {/* Correct Solution (if needed) */}
        {result.score < 10 && (
          <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl overflow-hidden relative print:bg-gray-800">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 text-brand-300 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              Lời giải tham khảo
            </h3>
            <div className="overflow-x-auto bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap font-mono text-xs sm:text-sm break-words leading-loose">
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {result.correctSolution}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Improvement Tips */}
        {result.tips.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm">
            <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-3 text-base sm:text-lg">
              <Lightbulb className="w-6 h-6 text-yellow-600 fill-yellow-100" />
              Lời khuyên giáo viên
            </h3>
            <ul className="space-y-3">
              {result.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-yellow-900 text-sm sm:text-base p-2 bg-white/50 rounded-lg border border-yellow-100/50">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 shadow-sm" />
                  <span className="break-words font-medium">
                    <MathMarkdown content={tip} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer for Image */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400 font-mono">
            Kết quả được chấm tự động bởi AI - APP HỖ TRỢ CHẤM BÀI MÔN TOÁN (Zalo: 0973 852 062)
        </div>
      </div>
    </div>
  );
};