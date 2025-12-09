import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GradingResult } from "../types";

// Must be provided via environment variable as per instructions
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const gradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    problemStatement: {
      type: Type.STRING,
      description: "Đề bài toán được trích xuất từ hình ảnh."
    },
    score: {
      type: Type.NUMBER,
      description: "Điểm số trên thang 10. Chấm chặt chẽ từng bước."
    },
    summary: {
      type: Type.STRING,
      description: "Nhận xét tổng quan ngắn gọn về bài làm."
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          content: { type: Type.STRING, description: "Mô tả bước làm của học sinh." },
          isCorrect: { type: Type.BOOLEAN },
          correction: { type: Type.STRING, description: "Sửa lỗi nếu bước này sai (để trống nếu đúng)." },
          feedback: { type: Type.STRING, description: "Nhận xét chi tiết cho bước này." }
        },
        required: ["stepNumber", "content", "isCorrect", "feedback"]
      }
    },
    correctSolution: {
      type: Type.STRING,
      description: "Lời giải đúng hoàn chỉnh (Markdown) nếu học sinh làm sai hoặc chưa tối ưu."
    },
    competencies: {
      type: Type.OBJECT,
      properties: {
        logic: { type: Type.STRING, description: "Đánh giá năng lực tư duy và lập luận toán học." },
        calculation: { type: Type.STRING, description: "Đánh giá năng lực tính toán." },
        presentation: { type: Type.STRING, description: "Đánh giá năng lực giao tiếp toán học (trình bày)." }
      },
      required: ["logic", "calculation", "presentation"]
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Các mẹo hoặc lưu ý để học sinh làm tốt hơn lần sau."
    }
  },
  required: ["problemStatement", "score", "summary", "steps", "correctSolution", "competencies", "tips"]
};

export const analyzeMathProblem = async (base64Image: string): Promise<GradingResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: `Bạn là một giáo viên Toán học Việt Nam xuất sắc, am hiểu sâu sắc Chương trình Giáo dục Phổ thông 2018 (CT 2018).
          
          Nhiệm vụ của bạn là chấm bài làm toán trong hình ảnh được cung cấp.
          
          Hãy thực hiện các bước sau:
          1. Nhận diện đề bài toán.
          2. Phân tích từng bước giải của học sinh.
          3. Kiểm tra tính chính xác của tính toán, tính logic của lập luận và cách trình bày.
          4. Chấm điểm theo thang điểm 10.
          5. Đưa ra nhận xét phát triển phẩm chất và năng lực (tư duy, tính toán, trình bày).
          6. Nếu bài làm sai, hãy chỉ ra chỗ sai và cung cấp lời giải đúng chuẩn mực.
          
          Yêu cầu:
          - Giọng điệu sư phạm, khích lệ nhưng nghiêm khắc về tính chính xác.
          - Chú trọng vào tư duy logic hơn là chỉ kết quả cuối cùng.
          - Sử dụng Tiếng Việt chuẩn.
          `
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
        thinkingConfig: {
          thinkingBudget: 8192 // Allocate thinking budget for complex math reasoning
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GradingResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};