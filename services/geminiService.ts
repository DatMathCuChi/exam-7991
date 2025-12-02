import { GoogleGenAI, Type } from "@google/genai";
import { TopicPlan, ModelType, QuestionType, DifficultyLevel, MathTopic, Difficulty, PracticeQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TEMPLATES ---

const EX_TEST_TEMPLATES = {
  MCQ: `\\begin{ex} %Câu X:[Chủ đề - Mức độ]
Nội dung câu hỏi với $công\\ thức$.
\\choice
{Đáp án A}
{Đáp án B}
{Đáp án C}
{\\True Đáp án D đúng}
\\loigiai{Lời giải chi tiết.\\\\}
\\end{ex}`,
  TF: `\\begin{ex} %Câu X:[Chủ đề - Mức độ]
Cho ... Xét đúng/sai các mệnh đề:
\\choiceTF
{\\True Mệnh đề đúng}
{Mệnh đề sai}
{\\True Mệnh đề đúng}
{Mệnh đề sai}
\\loigiai{Giải thích.\\\\}
\\end{ex}`,
  SA: `\\begin{ex} %Câu X:[Chủ đề - Mức độ]
Câu hỏi trả lời ngắn.
\\shortans{Đáp án}
\\loigiai{Lời giải tóm tắt.\\\\}
\\end{ex}`
};

const WORD_TEMPLATES = {
  MCQ: `Câu X: [Chủ đề - Mức độ] Nội dung câu hỏi với $công\\ thức$?
A. Đáp án A
B. Đáp án B
C. Đáp án C
D. Đáp án D
(Đáp án đúng: D)
Lời giải: Giải thích chi tiết...`,
  TF: `Câu X: [Chủ đề - Mức độ] Cho ... Xét tính đúng sai:
a) Mệnh đề 1 ($công\\ thức$) -> ĐÚNG
b) Mệnh đề 2 -> SAI
c) Mệnh đề 3 -> ĐÚNG
d) Mệnh đề 4 -> SAI
Lời giải: Giải thích chi tiết...`,
  SA: `Câu X: [Chủ đề - Mức độ] Nội dung câu hỏi?
Đáp án: $kết\\ quả$
Lời giải: Giải thích chi tiết...`
};

const DIFFICULTY_GUIDE = `
- NB (Nhận biết): Nhớ lại, nhận ra kiến thức cơ bản.
- TH (Thông hiểu): Hiểu, diễn giải, áp dụng cơ bản.
- VD (Vận dụng): Áp dụng kiến thức vào tình huống cụ thể để giải quyết vấn đề.`;

// --- MAIN GENERATION FUNCTIONS ---

export const generateExamPart = async (
  modelName: ModelType,
  plans: TopicPlan[],
  type: QuestionType,
  outputFormat: 'latex' | 'word',
  subject: string
): Promise<string> => {
  if (plans.length === 0) return "";
  
  // Group plans by topic
  const topicsSummary = plans.map(p => `- ${p.count} câu về "${p.topic}" mức độ ${p.level}`).join("\n");
  const totalCount = plans.reduce((sum, p) => sum + p.count, 0);
  
  const template = outputFormat === 'latex' ? EX_TEST_TEMPLATES[type] : WORD_TEMPLATES[type];
  const formatInstructions = outputFormat === 'latex' 
    ? "Tuân thủ nghiêm ngặt định dạng LaTeX gói ex_test. Dùng $...$ cho công thức toán." 
    : "Định dạng văn bản rõ ràng. QUAN TRỌNG: Tất cả công thức toán, biểu thức, biến số PHẢI viết dạng LaTeX và đặt trong cặp dấu $ (ví dụ: $x^2+1=0$). Không dùng Unicode cho toán học.";

  const systemInstruction = `Bạn là chuyên gia ra đề thi môn ${subject}, thành thạo kỹ năng sư phạm và toán học.
Nhiệm vụ: Sinh ra CHÍNH XÁC ${totalCount} khối câu hỏi loại ${type} (${outputFormat === 'latex' ? 'LaTeX' : 'Word'}).
${formatInstructions}
Mẫu định dạng:
${template}

Hướng dẫn mức độ:
${DIFFICULTY_GUIDE}

Quy tắc:
1. Luôn có lời giải chi tiết và chính xác.
2. Tiếng Việt chuẩn mực.
3. Nội dung phong phú, số liệu hợp lý.
4. Chỉ sử dụng 3 mức độ: Nhận biết (NB), Thông hiểu (TH), Vận dụng (VD).`;

  const prompt = `Hãy tạo ${totalCount} câu hỏi ${type} cho môn ${subject} với phân bổ:\n${topicsSummary}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error(`Error generating ${type}:`, error);
    return `Lỗi khi tạo phần ${type}. Vui lòng thử lại.`;
  }
};

export const generateFullExam = async (
  model: ModelType,
  plans: TopicPlan[],
  outputFormat: 'latex' | 'word',
  subject: string
): Promise<string> => {
  const mcqPlans = plans.filter(p => p.type === 'MCQ');
  const tfPlans = plans.filter(p => p.type === 'TF');
  const saPlans = plans.filter(p => p.type === 'SA');

  try {
    const [mcqContent, tfContent, saContent] = await Promise.all([
      generateExamPart(model, mcqPlans, 'MCQ', outputFormat, subject),
      generateExamPart(model, tfPlans, 'TF', outputFormat, subject),
      generateExamPart(model, saPlans, 'SA', outputFormat, subject),
    ]);

    const header = outputFormat === 'latex' 
      ? `% ====================================\n% ĐỀ THI TOÁN - Cấu trúc 7991\n% Môn: ${subject.toUpperCase()} - Ngày tạo: ${new Date().toLocaleDateString()}\n% ====================================\n`
      : `ĐỀ THI TOÁN - Cấu trúc 7991\nMôn: ${subject.toUpperCase()}\nNgày tạo: ${new Date().toLocaleDateString()}\n------------------------------------\n`;

    return `${header}\n\n[PHẦN TRẮC NGHIỆM]\n${mcqContent}\n\n[PHẦN ĐÚNG SAI]\n${tfContent}\n\n[PHẦN TRẢ LỜI NGẮN]\n${saContent}`;
  } catch (error) {
    throw error;
  }
};

// --- AUTO SUGGESTION ---

export const suggestTopicPlan = async (
  grade: string,
  subject: string,
  modelName: ModelType
): Promise<TopicPlan[]> => {
  const prompt = `Bạn là tổ trưởng chuyên môn môn Toán lớp ${grade} theo chương trình GDPT 2018.
  Hãy lập một MA TRẬN ĐỀ THI mẫu cấu trúc 7991 (22 câu: 12 Trắc nghiệm, 4 Đúng/Sai, 6 Trả lời ngắn).
  
  YÊU CẦU:
  1. Chủ đề phải là các bài học cụ thể trong chương trình Toán lớp ${grade}.
  2. Phân bổ mức độ chỉ gồm: NB (Nhận biết), TH (Thông hiểu), VD (Vận dụng).
  3. KHÔNG sử dụng mức độ Vận dụng cao (VDC).
  
  Ví dụ chủ đề: "Phương trình bậc hai", "Hệ thức lượng", "Thống kê", "Xác suất"...`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING, description: "Tên bài học cụ thể" },
              type: { type: Type.STRING, enum: ["MCQ", "TF", "SA"] },
              count: { type: Type.INTEGER },
              level: { type: Type.STRING, enum: ["NB", "TH", "VD"] }
            },
            required: ["topic", "type", "count", "level"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty plan");

    return data.map((item: any, index: number) => ({
      ...item,
      id: `${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error("Error auto-suggesting plan:", error);
    
    return [
      { id: '1', topic: 'Đại số (Cơ bản)', type: 'MCQ', count: 4, level: 'NB' },
      { id: '2', topic: 'Đại số (Nâng cao)', type: 'MCQ', count: 4, level: 'TH' },
      { id: '3', topic: 'Hình học (Cơ bản)', type: 'MCQ', count: 4, level: 'NB' },
      { id: '4', topic: 'Hàm số', type: 'TF', count: 2, level: 'TH' },
      { id: '5', topic: 'Hình học (Nâng cao)', type: 'TF', count: 2, level: 'VD' },
      { id: '6', topic: 'Thống kê', type: 'SA', count: 3, level: 'VD' },
      { id: '7', topic: 'Xác suất', type: 'SA', count: 3, level: 'VD' },
    ];
  }
};

// --- PRACTICE & SOLVER ---

export const generateMathProblem = async (
  topic: MathTopic,
  difficulty: Difficulty
): Promise<PracticeQuestion> => {
  const prompt = `Tạo một câu hỏi trắc nghiệm toán học về chủ đề "${topic}" với độ khó "${difficulty}".
  Yêu cầu:
  1. Câu hỏi rõ ràng, có thể chứa công thức LaTeX (dùng $...$).
  2. 4 đáp án lựa chọn.
  3. Chỉ định đáp án đúng.
  4. Giải thích chi tiết từng bước.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Danh sách 4 lựa chọn"
            },
            correctAnswer: { type: Type.STRING, description: "Phải trùng khớp hoàn toàn với một trong các options" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    // Validate basic structure
    if (!data.question || !Array.isArray(data.options)) {
        throw new Error("Invalid response structure");
    }
    return data as PracticeQuestion;
  } catch (error) {
    console.error("Error generating math problem:", error);
    throw error;
  }
};

export const solveMathProblem = async (problemText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use a smarter model for solving
      contents: problemText,
      config: {
        systemInstruction: "Bạn là một giáo viên dạy toán giỏi. Hãy giải bài toán sau đây từng bước một, sử dụng LaTeX cho các công thức toán học (đặt trong $...$ hoặc $$...$$). Giải thích rõ ràng, dễ hiểu. Nếu đề bài không rõ ràng, hãy hỏi lại hoặc đưa ra giả định hợp lý.",
      }
    });
    return response.text || "Xin lỗi, tôi không thể giải bài toán này.";
  } catch (error) {
    console.error("Error solving math problem:", error);
    return "Đã xảy ra lỗi khi giải bài toán. Vui lòng thử lại.";
  }
};