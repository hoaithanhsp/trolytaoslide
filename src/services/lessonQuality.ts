import { LessonType } from '../data/lessonTypeDB';
import { StandardStructure } from '../types';

export interface LessonQualityOptions {
  subjectName: string;
  durationPeriods: number;
  lessonType: LessonType;
  standardStructure?: StandardStructure;
  hasTextbook: boolean;
}

export interface LessonQualityStats {
  wordCount: number;
  formulaCount: number;
  workedExampleCount: number;
  solutionCount: number;
  exerciseCount: number;
  stepOneCount: number;
  productCount: number;
  questionCount: number;
  placeholderCount: number;
}

export interface LessonQualityAssessment {
  passed: boolean;
  score: number;
  issues: string[];
  stats: LessonQualityStats;
}

const STOP_WORDS = new Set([
  'bai', 'tiet', 'chuong', 'phan', 'hoc', 'mon', 'lop', 'va', 'voi', 'cua',
  'cac', 'mot', 'nhung', 'cho', 'trong', 've', 'theo', 'hoat', 'dong', 'noi',
  'dung', 'giao', 'an', 'ke', 'hoach', 'day', 'thuc', 'hanh', 'on', 'tap',
]);

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length || 0;
}

function getSubjectKind(subjectName: string): 'math' | 'physics' | 'chemistry' | 'literature' | 'english' | 'general' {
  const subject = normalizeForSearch(subjectName);
  if (subject.includes('toan') || subject.includes('math')) return 'math';
  if (subject.includes('vat ly') || subject.includes('physics') || subject === 'ly') return 'physics';
  if (subject.includes('hoa hoc') || subject.includes('chemistry') || subject === 'hoa') return 'chemistry';
  if (subject.includes('ngu van') || subject.includes('van hoc') || subject.includes('literature')) return 'literature';
  if (subject.includes('tieng anh') || subject.includes('english') || subject.includes('ngoai ngu')) return 'english';
  return 'general';
}

function makeChunks(source: string, targetSize = 1800): string[] {
  const normalized = source
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n')
    .trim();

  if (!normalized) return [];

  const blocks = normalized.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };

  for (const block of blocks.length > 1 ? blocks : normalized.split('\n').filter(Boolean)) {
    if (block.length > targetSize * 1.5) {
      flush();
      for (let offset = 0; offset < block.length; offset += targetSize) {
        chunks.push(block.slice(offset, offset + targetSize));
      }
      continue;
    }

    if (current && current.length + block.length + 2 > targetSize) flush();
    current += `${current ? '\n\n' : ''}${block}`;
  }
  flush();
  return chunks;
}

/**
 * Keep the source passages that are most relevant to the current lesson instead
 * of sending an entire textbook/reference book for every period.
 */
export function selectRelevantContext(source: string, lessonTitle: string, maxChars: number): string {
  const cleanSource = source.trim();
  if (!cleanSource || cleanSource.length <= maxChars) return cleanSource;

  const chunkSize = Math.min(1600, Math.max(250, Math.floor(maxChars / 3)));
  const chunks = makeChunks(cleanSource, chunkSize);
  if (chunks.length === 0) return '';

  const normalizedTitle = normalizeForSearch(lessonTitle)
    .replace(/\b(?:bai|tiet)\s+\d+\b/g, '')
    .trim();
  const keywords = [...new Set(normalizeForSearch(lessonTitle).split(' '))]
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));

  const ranked = chunks.map((chunk, index) => {
    const normalizedChunk = normalizeForSearch(chunk);
    let score = 0;
    if (normalizedTitle.length >= 6 && normalizedChunk.includes(normalizedTitle)) score += 30;
    for (const keyword of keywords) {
      const occurrences = normalizedChunk.split(keyword).length - 1;
      score += Math.min(occurrences, 4) * 3;
    }
    const firstLine = normalizeForSearch(chunk.split('\n')[0] || '');
    if (keywords.some(keyword => firstLine.includes(keyword))) score += 8;
    return { index, score };
  }).sort((a, b) => b.score - a.score || a.index - b.index);

  const chosen = new Set<number>();
  let usedChars = 0;
  const separator = '\n\n[... phần không liên quan đã được lược bỏ ...]\n\n';
  const addChunk = (index: number) => {
    if (index < 0 || index >= chunks.length || chosen.has(index)) return;
    const additional = chunks[index].length + (chosen.size > 0 ? separator.length : 0);
    if (chosen.size > 0 && usedChars + additional > maxChars) return;
    chosen.add(index);
    usedChars += additional;
  };

  const positiveMatches = ranked.filter(item => item.score > 0);
  for (const item of positiveMatches) {
    if (usedChars >= maxChars) break;
    addChunk(item.index);
    // Neighbouring passages normally contain the definition, example or exercise
    // immediately before/after a matching heading.
    if (item.score > 0) {
      addChunk(item.index - 1);
      addChunk(item.index + 1);
    }
  }

  // If no title/keyword was found, retain the beginning as a conservative
  // fallback. Do not mix unrelated leading chapters into a successful match.
  if (chosen.size === 0) {
    for (let index = 0; index < chunks.length && usedChars < maxChars; index++) addChunk(index);
  }
  return [...chosen]
    .sort((a, b) => a - b)
    .map(index => chunks[index])
    .join(separator);
}

export function buildLessonQualityRequirements(options: LessonQualityOptions): string {
  const periods = Math.max(1, Math.min(10, options.durationPeriods || 1));
  const subjectKind = getSubjectKind(options.subjectName);
  const minWords = Math.min(7000, 1800 + (periods - 1) * 850);
  const maxWords = Math.min(9000, minWords + 1200);
  const exampleTarget = Math.min(8, 3 + Math.floor((periods - 1) / 2));
  const exerciseTarget = Math.min(20, 10 + (periods - 1) * 2);

  const common = `
═══════════════════════════════════════════════════════════
CHUẨN CHẤT LƯỢNG NỘI DUNG - BẮT BUỘC
═══════════════════════════════════════════════════════════
- Độ dài mục tiêu: khoảng ${minWords}-${maxWords} từ có nội dung thực chất; không kéo dài bằng câu chữ lặp lại.
- MẪU chỉ quyết định hình thức, thứ tự mục và số tiểu hoạt động. Tuyệt đối không sao chép sự sơ lược, dòng chấm hay ô trống của mẫu.
- Mọi mục "Nội dung" phải ghi nguyên văn nhiệm vụ/câu hỏi/bài toán/dữ kiện mà học sinh thực hiện. Không viết chung chung kiểu "GV giao bài tập", "HS nghiên cứu SGK", "làm câu hỏi trên Quizizz".
- Mọi mục "Sản phẩm" phải nêu đáp án, kết quả, bảng, sơ đồ, đoạn trình bày hoặc tiêu chí cụ thể cần thu được; không chỉ viết "câu trả lời của HS" hay "phiếu học tập hoàn thành".
- Trong từng "Tổ chức thực hiện": Bước 1 ghi chính xác lời giao nhiệm vụ và câu hỏi; Bước 2 nêu cách HS xử lí; Bước 3 nêu nội dung dự kiến báo cáo/thảo luận; Bước 4 chốt kiến thức chuyên môn và sửa sai.
- Hoạt động hình thành kiến thức phải chia thành các tiểu hoạt động theo đúng mẫu, mỗi tiểu hoạt động hình thành một đơn vị kiến thức rõ ràng và có ít nhất một nhiệm vụ khám phá cụ thể.
- Khởi động có 2-4 câu hỏi hoặc một tình huống chứa dữ kiện thật; kèm đáp án dự kiến và câu nối vào bài.
- Luyện tập có hệ thống nhiệm vụ phân hóa từ nhận biết, thông hiểu đến vận dụng; mỗi câu đều có đáp án hoặc hướng dẫn giải ngay trong giáo án.
- Vận dụng phải là một tình huống thực tế có dữ liệu, yêu cầu, sản phẩm nộp và tiêu chí đánh giá rõ ràng.
- Có mục "Dự kiến khó khăn/sai lầm và cách hỗ trợ"; phân hóa nhiệm vụ cho HS cần hỗ trợ và HS khá giỏi.
- Không viện dẫn số bài trong SGK nếu nguồn cung cấp không chứa nguyên văn đề bài. Không tự bịa trích dẫn, số trang, tên video hoặc liên kết.
- Chỉ trả về giáo án hoàn chỉnh bằng Markdown; không viết lời mở đầu, lời xin lỗi, nhận xét về bản nháp hay khối mã.
${options.hasTextbook ? '- Nội dung SGK đã được cung cấp: ưu tiên tuyệt đối thuật ngữ, trình tự kiến thức, ví dụ và mức độ của nguồn này.' : '- Chưa có toàn văn SGK: bám sát tên bài, cấp/lớp và kiến thức chuẩn; không giả vờ trích nguyên văn SGK.'}`;

  if (subjectKind === 'math') {
    return `${common}

YÊU CẦU RIÊNG CHO MÔN TOÁN:
- Nêu đầy đủ định nghĩa, định lí/tính chất, điều kiện áp dụng và quy trình giải; các ý phải liên kết đúng với tên bài.
- Có ít nhất 12 biểu thức/công thức Toán khác nhau bằng LaTeX $...$ hoặc $$...$$. Công thức phải xuất hiện trong phần kiến thức, ví dụ, bài tập và đáp án - không gom để đối phó.
- Có ít nhất ${exampleTarget} ví dụ mẫu được đánh số, mỗi ví dụ gồm đề bài cụ thể, phân tích, lời giải từng bước và kết luận.
- Có ít nhất ${exerciseTarget} câu/bài tập cụ thể, được đánh số và phân hóa; kèm đáp án hoặc hướng dẫn giải. Không thay đề bài bằng cụm "Bài 1.1 đến 1.4".
- Với bài về hàm số/đạo hàm: phải có hàm số cụ thể, phép tính đạo hàm, điều kiện dấu, khoảng biến thiên/cực trị và bảng biến thiên khi phù hợp.
- Kí hiệu, điều kiện xác định, biến đổi và kết quả phải nhất quán; tự kiểm tra lại phép tính trước khi trả lời.`;
  }

  if (subjectKind === 'physics') {
    return `${common}

YÊU CẦU RIÊNG CHO MÔN VẬT LÍ:
- Có ít nhất 8 công thức LaTeX, giải thích đại lượng, đơn vị SI và điều kiện áp dụng.
- Có ít nhất 3 ví dụ định lượng giải từng bước và 8 bài tập phân hóa kèm đáp án; kiểm tra thứ nguyên và đơn vị.
- Nếu có thí nghiệm, ghi rõ dụng cụ, thao tác, bảng số liệu dự kiến, xử lí số liệu, sai số và kết luận.`;
  }

  if (subjectKind === 'chemistry') {
    return `${common}

YÊU CẦU RIÊNG CHO MÔN HÓA HỌC:
- Viết đầy đủ công thức chất, phương trình phản ứng đã cân bằng, trạng thái/điều kiện và hiện tượng khi phù hợp.
- Có ít nhất 3 ví dụ tính toán giải từng bước và 8 câu/bài tập phân hóa kèm đáp án.
- Với thí nghiệm, nêu hóa chất, dụng cụ, quy trình an toàn, hiện tượng dự kiến, giải thích và xử lí chất thải.`;
  }

  if (subjectKind === 'literature') {
    return `${common}

YÊU CẦU RIÊNG CHO NGỮ VĂN:
- Mỗi nhiệm vụ đọc hiểu phải có ngữ liệu hoặc chỉ dẫn phạm vi rõ ràng, hệ thống câu hỏi tăng dần và đáp án/gợi ý phân tích cụ thể.
- Có dẫn chứng, thao tác lập luận, sản phẩm viết/nói và bảng tiêu chí đánh giá. Chỉ trích nguyên văn khi ngữ liệu đã được cung cấp.`;
  }

  if (subjectKind === 'english') {
    return `${common}

YÊU CẦU RIÊNG CHO NGOẠI NGỮ:
- Ghi rõ mục tiêu ngôn ngữ, từ vựng/cấu trúc, ví dụ đúng-sai, hướng dẫn phát âm khi phù hợp.
- Mỗi hoạt động có input, instruction, expected answer và tiêu chí đánh giá; có bài tập kiểm soát, luyện tập giao tiếp và đáp án.`;
  }

  return `${common}

YÊU CẦU RIÊNG CHO MÔN ${options.subjectName.toUpperCase()}:
- Dùng đúng thuật ngữ và phương pháp đặc thù môn học; đưa kiến thức cốt lõi vào phần GV chốt, không chỉ mô tả hoạt động.
- Có ít nhất 3 ví dụ/tình huống cụ thể và 8 câu hỏi/nhiệm vụ phân hóa kèm đáp án hoặc tiêu chí đánh giá.`;
}

export function assessLessonQuality(content: string, options: LessonQualityOptions): LessonQualityAssessment {
  const subjectKind = getSubjectKind(options.subjectName);
  const isStructure2 = options.lessonType === 'standard' && options.standardStructure === 'structure2';
  const periods = Math.max(1, Math.min(10, options.durationPeriods || 1));
  const minWords = Math.min(7000, 1500 + (periods - 1) * 700);
  const requiredSteps = options.lessonType === 'stem' ? 5 : Math.min(9, 6 + Math.floor((periods - 1) / 2));
  const requiredProducts = options.lessonType === 'stem' ? 5 : 5;

  const displayMath = countMatches(content, /\$\$[\s\S]*?\$\$/g);
  const withoutDisplayMath = content.replace(/\$\$[\s\S]*?\$\$/g, '');
  const inlineMath = countMatches(withoutDisplayMath, /\$(?!\$)[^$\n]+\$/g);
  const stats: LessonQualityStats = {
    wordCount: countMatches(content, /[\p{L}\p{N}]+/gu),
    formulaCount: displayMath + inlineMath,
    workedExampleCount: countMatches(content, /(?:ví dụ|bài toán mẫu)\s*(?:\d+)?/giu),
    solutionCount: countMatches(content, /(?:lời giải|hướng dẫn giải|giải chi tiết|đáp án)/giu),
    exerciseCount: countMatches(content, /(?:câu|bài tập|bài toán)\s*(?:số\s*)?\d+/giu),
    stepOneCount: countMatches(content, /bước\s*1/giu),
    productCount: isStructure2
      ? countMatches(content, /(?:^|\n)\s*(?:\*\*)?(?:c[.)]\s*sản phẩm|\bsản phẩm\s*:|\bsản phẩm là\b|\bđáp án\s*:|\blời giải\s*:)/gimu)
      : countMatches(content, /(?:^|\n)\s*(?:\*\*)?c[.)]\s*sản phẩm|\bsản phẩm\s*:/gimu),
    questionCount: countMatches(content, /\?/g),
    placeholderCount: countMatches(
      content,
      /(?:\.{4,}|…{2,}|\[điền|\[bổ sung|bài tập\s+\d+(?:\.\d+)?\s*(?:đến|-)\s*\d+|các bài tập trong sgk|các câu hỏi trên|(?:chiếu|xem)\s+video(?:\s+ai)?(?:\s+mô phỏng)?|(?:c[.)]\s*sản phẩm|sản phẩm:)[^\n]{0,120}(?:câu trả lời của (?:hs|học sinh)|phiếu học tập (?:hoàn chỉnh|hoàn thành)|kết quả thảo luận|lời giải (?:chi tiết )?(?:các )?(?:hoạt động|bài tập))[ \t]*\.?[ \t]*$)/gimu,
    ),
  };

  const issues: string[] = [];
  if (stats.wordCount < minWords) {
    issues.push(`Nội dung mới có ${stats.wordCount} từ; cần ít nhất khoảng ${minWords} từ có nội dung thực chất.`);
  }
  if (stats.stepOneCount < requiredSteps) {
    issues.push(`Mới có ${stats.stepOneCount} quy trình tổ chức đầy đủ; cần ít nhất ${requiredSteps} tiểu hoạt động có 4 bước.`);
  }
  if (stats.productCount < requiredProducts) {
    issues.push(isStructure2
      ? `Mới có ${stats.productCount} mục kết quả/sản phẩm học tập cụ thể trong các bước; cần ít nhất ${requiredProducts}.`
      : `Mới có ${stats.productCount} mục Sản phẩm cụ thể; cần ít nhất ${requiredProducts}.`
    );
  }
  if (stats.questionCount < 5) {
    issues.push('Nhiệm vụ/câu hỏi dành cho học sinh còn quá ít hoặc chưa được viết thành câu cụ thể.');
  }
  if (stats.placeholderCount >= 2) {
    issues.push('Còn nhiều placeholder hoặc chỉ dẫn chung chung thay cho nội dung dạy học thực tế.');
  }

  if (subjectKind === 'math') {
    const requiredFormulas = Math.min(18, 8 + (periods - 1) * 2);
    const requiredExamples = Math.min(6, 3 + Math.floor((periods - 1) / 2));
    const requiredExercises = Math.min(16, 8 + (periods - 1) * 2);
    if (stats.formulaCount < requiredFormulas) issues.push(`Giáo án Toán mới có ${stats.formulaCount} công thức LaTeX; cần ít nhất ${requiredFormulas}.`);
    if (stats.workedExampleCount < requiredExamples) issues.push(`Mới có ${stats.workedExampleCount} ví dụ mẫu; cần ít nhất ${requiredExamples} ví dụ có lời giải.`);
    if (stats.exerciseCount < requiredExercises) issues.push(`Mới có ${stats.exerciseCount} bài/câu được đánh số; cần ít nhất ${requiredExercises} bài tập cụ thể.`);
    if (stats.solutionCount < 3) issues.push('Thiếu lời giải/đáp án chi tiết cho ví dụ và hệ thống bài tập Toán.');
  } else if (subjectKind === 'physics' || subjectKind === 'chemistry') {
    if (stats.formulaCount < 5) issues.push('Thiếu công thức/phương trình chuyên môn được định dạng LaTeX.');
    if (stats.exerciseCount < 6) issues.push('Hệ thống ví dụ và bài tập định lượng còn ít.');
  }

  const wordScore = Math.min(30, (stats.wordCount / minWords) * 30);
  const structureScore = Math.min(20, (stats.stepOneCount / requiredSteps) * 20);
  const productScore = Math.min(12, (stats.productCount / requiredProducts) * 12);
  const taskScore = Math.min(13, (stats.questionCount / 8) * 13);
  const subjectScore = subjectKind === 'math'
    ? Math.min(25, (stats.formulaCount / 8) * 10 + (stats.workedExampleCount / 3) * 7 + (stats.exerciseCount / 8) * 8)
    : Math.min(25, (stats.workedExampleCount / 3) * 10 + (stats.exerciseCount / 6) * 15);
  const placeholderPenalty = Math.min(15, stats.placeholderCount * 4);
  const issuePenalty = issues.length * 6;
  const score = Math.max(0, Math.min(100, Math.round(wordScore + structureScore + productScore + taskScore + subjectScore - placeholderPenalty - issuePenalty)));

  return { passed: issues.length === 0, score, issues, stats };
}
