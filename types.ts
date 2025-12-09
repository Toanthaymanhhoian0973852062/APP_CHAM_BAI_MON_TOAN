export interface GradingStep {
  stepNumber: number;
  content: string; // Description of the student's step
  isCorrect: boolean;
  correction?: string; // If wrong, what is the correct logic?
  feedback: string;
}

export interface GradingResult {
  problemStatement: string; // What the AI thinks the problem is
  score: number; // 0-10
  summary: string; // General comment
  steps: GradingStep[];
  correctSolution: string; // Full correct solution path if student failed
  competencies: {
    logic: string; // Assessment of logical thinking
    calculation: string; // Assessment of calculation accuracy
    presentation: string; // Assessment of presentation/notation
  };
  tips: string[]; // Improvement tips
}

export interface Submission {
  id: string;
  fileName: string;
  imageUrl: string;
  status: 'idle' | 'grading' | 'success' | 'error';
  result: GradingResult | null;
  errorMessage: string | null;
  uploadedAt: number;
  rotation: number; // Rotation angle in degrees
}