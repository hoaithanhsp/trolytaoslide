/**
 * Teaching Methods Database
 * Dữ liệu phương pháp & kĩ thuật dạy học tích cực
 * Nguồn: THAM KHAO/services/teachingMethodsDB.ts
 */

// =====================================
// PHƯƠNG PHÁP DẠY HỌC
// =====================================

export interface TeachingMethodOption {
  id: string;
  name: string;
  description: string;
  suitableFor: string;
  category: 'modern' | 'ai' | 'differentiated';
}

export interface TeachingTechniqueOption {
  id: string;
  name: string;
  description: string;
  group: 'warmup' | 'knowledge' | 'practice' | 'application';
  groupLabel: string;
}

// 15 phương pháp dạy học hiện đại
export const TEACHING_METHODS: TeachingMethodOption[] = [
  { id: 'pbl', name: 'Dạy học theo dự án (PBL)', description: 'HS giải quyết vấn đề thực tế qua dự án', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'stem', name: 'STEM/STEAM', description: 'Tích hợp Khoa học-Công nghệ-Kỹ thuật-Nghệ thuật-Toán', suitableFor: 'THCS, THPT', category: 'modern' },
  { id: 'flipped', name: 'Lớp học đảo ngược', description: 'Học lý thuyết ở nhà, thực hành trên lớp', suitableFor: 'THCS, THPT', category: 'modern' },
  { id: 'cooperative', name: 'Dạy học hợp tác', description: 'HS làm việc nhóm có cấu trúc', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'gamebased', name: 'Học qua trò chơi', description: 'Gamification: điểm thưởng, bảng xếp hạng, thử thách', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'differentiated', name: 'Dạy học phân hóa', description: 'Điều chỉnh nội dung theo năng lực HS', suitableFor: 'Tất cả cấp', category: 'differentiated' },
  { id: 'socratic', name: 'Kỹ thuật Socratic', description: 'Câu hỏi dẫn dắt tư duy phản biện', suitableFor: 'THCS, THPT', category: 'modern' },
  { id: 'mindmap', name: 'Bản đồ tư duy', description: 'Sơ đồ hóa kiến thức dạng cây', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'experiential', name: 'Học tập trải nghiệm', description: 'Học qua hoạt động thực hành, vận động', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: '5w1h', name: 'Kỹ thuật 5W1H', description: 'What, Why, When, Where, Who, How', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'tps', name: 'Think-Pair-Share', description: 'Suy nghĩ cá nhân → Thảo luận cặp → Chia sẻ lớp', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'jigsaw', name: 'Jigsaw (Mảnh ghép)', description: 'Chia nhóm chuyên gia → ghép lại → dạy nhau', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'gallery', name: 'Gallery Walk', description: 'Trình bày sản phẩm → đi tham quan → góp ý', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: 'kwl', name: 'KWL', description: 'Biết gì (K) → Muốn biết (W) → Đã học (L)', suitableFor: 'Tất cả cấp', category: 'modern' },
  { id: '5e', name: 'Mô hình 5E', description: 'Engage-Explore-Explain-Elaborate-Evaluate', suitableFor: 'KHTN', category: 'modern' },
];

// 20 kĩ thuật dạy học tích cực (4 nhóm)
export const TEACHING_TECHNIQUES: TeachingTechniqueOption[] = [
  // Nhóm 1: Khởi động
  { id: 'brainstorming', name: 'Brainstorming (Động não)', description: 'Đưa ra càng nhiều ý tưởng càng tốt không phán xét', group: 'warmup', groupLabel: 'Kỹ thuật Khởi động' },
  { id: 'kwl_tech', name: 'KWL', description: 'K-Biết gì, W-Muốn biết, L-Đã học', group: 'warmup', groupLabel: 'Kỹ thuật Khởi động' },
  { id: 'stimulating_q', name: 'Câu hỏi kích thích tư duy', description: 'Đặt tình huống thực tế liên quan bài học', group: 'warmup', groupLabel: 'Kỹ thuật Khởi động' },
  { id: 'puzzle_game', name: 'Trò chơi ô chữ/đố vui', description: 'Ôn kiến thức cũ, dẫn dắt vào bài mới', group: 'warmup', groupLabel: 'Kỹ thuật Khởi động' },

  // Nhóm 2: Hình thành kiến thức
  { id: 'tps_tech', name: 'Think-Pair-Share', description: 'Suy nghĩ → Chia sẻ cặp → Chia sẻ lớp', group: 'knowledge', groupLabel: 'Kỹ thuật Hình thành kiến thức' },
  { id: 'jigsaw_tech', name: 'Jigsaw (Mảnh ghép)', description: 'Chia nhóm chuyên gia → ghép lại', group: 'knowledge', groupLabel: 'Kỹ thuật Hình thành kiến thức' },
  { id: 'gallery_tech', name: 'Gallery Walk', description: 'Trưng bày → tham quan → phản hồi', group: 'knowledge', groupLabel: 'Kỹ thuật Hình thành kiến thức' },
  { id: 'station', name: 'Trạm học tập (Station Rotation)', description: 'HS di chuyển qua các trạm kiến thức', group: 'knowledge', groupLabel: 'Kỹ thuật Hình thành kiến thức' },
  { id: 'mindmap_tech', name: 'Sơ đồ tư duy', description: 'Hệ thống hóa kiến thức bằng bản đồ tư duy', group: 'knowledge', groupLabel: 'Kỹ thuật Hình thành kiến thức' },
  { id: 'tablecloth', name: 'Khăn trải bàn', description: 'Viết ý kiến cá nhân → thảo luận nhóm → tổng hợp', group: 'knowledge', groupLabel: 'Kỹ thuật Hình thành kiến thức' },

  // Nhóm 3: Luyện tập
  { id: 'differentiated_ex', name: 'Bài tập phân hóa', description: '3 mức độ: cơ bản/nâng cao/vận dụng', group: 'practice', groupLabel: 'Kỹ thuật Luyện tập' },
  { id: 'peer_assess', name: 'Đánh giá đồng đẳng (Peer Assessment)', description: 'HS chấm bài nhau theo tiêu chí', group: 'practice', groupLabel: 'Kỹ thuật Luyện tập' },
  { id: 'debate', name: 'Tranh luận có cấu trúc', description: '2 nhóm bảo vệ quan điểm đối lập', group: 'practice', groupLabel: 'Kỹ thuật Luyện tập' },
  { id: 'case_study', name: 'Case Study (Phân tích tình huống)', description: 'Phân tích tình huống thực tế', group: 'practice', groupLabel: 'Kỹ thuật Luyện tập' },
  { id: 'roleplay', name: 'Role-play (Đóng vai)', description: 'Đóng vai, nhập vai nhân vật trong tình huống', group: 'practice', groupLabel: 'Kỹ thuật Luyện tập' },

  // Nhóm 4: Vận dụng
  { id: 'mini_project', name: 'Dự án mini', description: 'HS thực hiện dự án nhỏ liên hệ thực tế', group: 'application', groupLabel: 'Kỹ thuật Vận dụng' },
  { id: 'learning_journal', name: 'Viết nhật ký học tập', description: 'Phản tư về quá trình học tập', group: 'application', groupLabel: 'Kỹ thuật Vận dụng' },
  { id: 'exit_ticket', name: 'Exit Ticket', description: '3 câu hỏi cuối giờ kiểm tra hiểu bài', group: 'application', groupLabel: 'Kỹ thuật Vận dụng' },
  { id: 'open_exercise', name: 'Bài tập mở', description: 'Cho phép nhiều cách giải, nhiều đáp án', group: 'application', groupLabel: 'Kỹ thuật Vận dụng' },
];

// Hoạt động học tập đặc thù THEO MÔN HỌC
const ACTIVITIES_BY_SUBJECT: Record<string, string[]> = {
  // Khoa học tự nhiên
  'toán': [
    'Giải bài tập theo nhóm',
    'Trò chơi toán học (đố vui, ô chữ số)',
    'Thảo luận phương pháp giải khác nhau',
    'Sử dụng GeoGebra/Desmos minh họa',
    'Bài tập phân hóa 3 mức độ',
    'Trình bày lời giải trước lớp',
    'Sáng tạo đề bài thực tế',
    'Peer Assessment chấm bài chéo',
  ],
  'vật lý': [
    'Thí nghiệm thực hành trực tiếp',
    'Mô phỏng PhET/thí nghiệm ảo',
    'Phân tích hiện tượng thực tế',
    'Thiết kế thí nghiệm đơn giản',
    'Thảo luận nhóm giải thích hiện tượng',
    'Xử lý số liệu và vẽ đồ thị',
    'Bài tập vận dụng liên hệ đời sống',
    'Trình bày poster kết quả TN',
  ],
  'hóa học': [
    'Thí nghiệm hóa học trực tiếp',
    'Quan sát và mô tả hiện tượng',
    'Cân bằng phương trình hóa học',
    'Bài tập tính toán theo PTHH',
    'Mô phỏng cấu trúc phân tử 3D',
    'Thảo luận ứng dụng thực tiễn',
    'Thiết kế thí nghiệm an toàn',
    'Trò chơi nhận diện chất/phản ứng',
  ],
  'sinh học': [
    'Quan sát mẫu vật/tiêu bản',
    'Thí nghiệm sinh học thực hành',
    'Sơ đồ tư duy hệ thống hóa',
    'Phân tích hình ảnh/video sinh học',
    'Thảo luận tình huống sinh thái',
    'Dự án nghiên cứu nhỏ',
    'Trò chơi phân loại sinh vật',
    'Liên hệ kiến thức với sức khỏe',
  ],
  // Khoa học xã hội
  'ngữ văn': [
    'Đọc diễn cảm/đọc phân vai',
    'Thảo luận phân tích tác phẩm',
    'Viết sáng tạo theo chủ đề',
    'Đóng vai nhân vật văn học',
    'Tranh luận về quan điểm tác giả',
    'Sơ đồ tư duy cốt truyện',
    'Peer Review bài viết',
    'Trình bày cảm nhận trước lớp',
  ],
  'lịch sử': [
    'Phân tích tư liệu/hình ảnh lịch sử',
    'Đóng vai nhân vật lịch sử',
    'Lập bảng niên biểu sự kiện',
    'Thảo luận nhóm đánh giá sự kiện',
    'So sánh các giai đoạn lịch sử',
    'Trình bày poster/infographic',
    'Xem và phân tích phim tài liệu',
    'Liên hệ bài học từ lịch sử',
  ],
  'địa lý': [
    'Đọc và phân tích bản đồ',
    'Xử lý số liệu thống kê',
    'Vẽ biểu đồ/lát cắt địa hình',
    'Thảo luận vấn đề môi trường',
    'Phân tích ảnh vệ tinh/Google Earth',
    'Dự án điều tra địa phương',
    'Trò chơi nhận biết vị trí địa lý',
    'Liên hệ kiến thức với thời sự',
  ],
  'gdcd': [
    'Thảo luận tình huống đạo đức',
    'Đóng vai xử lý tình huống pháp luật',
    'Phân tích case study thực tế',
    'Tranh luận về vấn đề xã hội',
    'Dự án phục vụ cộng đồng',
    'Xây dựng bộ quy tắc ứng xử',
    'Phỏng vấn/khảo sát thực tế',
    'Trình bày quan điểm cá nhân',
  ],
  // Ngoại ngữ
  'tiếng anh': [
    'Role-play hội thoại theo tình huống',
    'Nghe và hoàn thành phiếu bài tập',
    'Đọc hiểu và trả lời câu hỏi',
    'Viết đoạn văn/email/thư theo mẫu',
    'Trò chơi từ vựng (Kahoot, Quizlet)',
    'Thảo luận nhóm bằng tiếng Anh',
    'Presentation trước lớp',
    'Peer Correction sửa lỗi bài viết',
  ],
  // Thể chất & Nghệ thuật
  'gdtc': [
    'Trò chơi vận động khởi động',
    'Tập luyện theo nhóm kỹ năng',
    'Thi đấu/thi thử giữa các nhóm',
    'Phân tích kỹ thuật qua video/hình ảnh',
    'Sửa lỗi kỹ thuật theo cặp (Peer Coaching)',
    'Trạm tập luyện xoay vòng (Circuit Training)',
    'Tập luyện theo mức độ (phân hóa thể lực)',
    'Trò chơi dân gian có vận động',
  ],
  'âm nhạc': [
    'Nghe nhạc và cảm nhận',
    'Thực hành hát/chơi nhạc cụ',
    'Phân tích tác phẩm âm nhạc',
    'Sáng tạo giai điệu/tiết tấu',
    'Biểu diễn nhóm trước lớp',
    'Trò chơi nhận biết nhạc cụ/giai điệu',
    'Vận động theo nhạc',
    'So sánh các thể loại âm nhạc',
  ],
  'mỹ thuật': [
    'Thực hành vẽ/tạo hình',
    'Phân tích tác phẩm mỹ thuật',
    'Thiết kế sản phẩm sáng tạo',
    'Gallery Walk trưng bày tác phẩm',
    'Peer Review đánh giá tác phẩm',
    'Sử dụng Canva/công cụ số thiết kế',
    'Thảo luận xu hướng nghệ thuật',
    'Dự án mỹ thuật ứng dụng',
  ],
  'tin học': [
    'Thực hành lập trình trên máy tính',
    'Debug và sửa lỗi code theo cặp',
    'Thiết kế thuật toán bằng sơ đồ',
    'Dự án phần mềm nhóm',
    'Trình bày demo sản phẩm',
    'Thảo luận an toàn thông tin',
    'Trò chơi logic/thuật toán',
    'Thực hành ứng dụng công cụ số',
  ],
  'công nghệ': [
    'Thực hành chế tạo/lắp ráp',
    'Thiết kế bản vẽ kỹ thuật',
    'Phân tích quy trình công nghệ',
    'Dự án STEM ứng dụng',
    'Thảo luận giải pháp kỹ thuật',
    'Tham quan mô hình/xưởng thực hành',
    'Đánh giá sản phẩm công nghệ',
    'Trình bày ý tưởng thiết kế',
  ],
};

// Danh sách chung (fallback khi không nhận diện được môn)
export const DEFAULT_ACTIVITIES = [
  'Thảo luận nhóm chuyên đề',
  'Thực hành/thí nghiệm trực tiếp',
  'Phân tích tình huống thực tế',
  'Trò chơi học tập khởi động',
  'Tập luyện kỹ năng theo nhóm',
  'Thi đấu/thi thử giữa các nhóm',
  'Phân tích qua video/hình ảnh minh họa',
  'Sửa lỗi theo cặp (Peer Coaching)',
  'Trạm học tập xoay vòng (Station Rotation)',
  'Sáng tạo sản phẩm/dự án mini',
  'Trình bày/thuyết trình trước lớp',
  'Thực hành ứng dụng công nghệ số',
];

/**
 * Trả danh sách hoạt động đặc thù dựa trên tên môn học
 */
export function getSubjectActivities(subjectName: string): string[] {
  if (!subjectName) return DEFAULT_ACTIVITIES;

  const normalized = subjectName.toLowerCase().trim();

  // Tìm khớp trực tiếp
  if (ACTIVITIES_BY_SUBJECT[normalized]) {
    return ACTIVITIES_BY_SUBJECT[normalized];
  }

  // Tìm khớp một phần (VD: "Giáo dục thể chất" → "gdtc", "Toán học" → "toán")
  const ALIASES: Record<string, string> = {
    'giáo dục thể chất': 'gdtc',
    'thể dục': 'gdtc',
    'thể chất': 'gdtc',
    'toán học': 'toán',
    'toán': 'toán',
    'vật lí': 'vật lý',
    'hoá học': 'hóa học',
    'hóa': 'hóa học',
    'sinh': 'sinh học',
    'văn': 'ngữ văn',
    'ngữ văn': 'ngữ văn',
    'sử': 'lịch sử',
    'lịch sử': 'lịch sử',
    'địa': 'địa lý',
    'địa lí': 'địa lý',
    'english': 'tiếng anh',
    'anh': 'tiếng anh',
    'anh văn': 'tiếng anh',
    'gdcd': 'gdcd',
    'giáo dục công dân': 'gdcd',
    'kinh tế và pháp luật': 'gdcd',
    'nhạc': 'âm nhạc',
    'mĩ thuật': 'mỹ thuật',
    'nghệ thuật': 'mỹ thuật',
    'it': 'tin học',
    'lập trình': 'tin học',
    'khtn': 'vật lý',
    'khoa học tự nhiên': 'vật lý',
  };

  for (const [alias, key] of Object.entries(ALIASES)) {
    if (normalized.includes(alias)) {
      return ACTIVITIES_BY_SUBJECT[key] || DEFAULT_ACTIVITIES;
    }
  }

  return DEFAULT_ACTIVITIES;
}


/**
 * Build prompt context string from selected methods & techniques
 */
export function buildTeachingMethodsPrompt(
  selectedMethodIds: string[],
  selectedTechniqueIds: string[],
  selectedActivities: string[]
): string {
  const methods = TEACHING_METHODS.filter(m => selectedMethodIds.includes(m.id));
  const techniques = TEACHING_TECHNIQUES.filter(t => selectedTechniqueIds.includes(t.id));

  let prompt = '';

  if (methods.length > 0) {
    prompt += '\n\nPHƯƠNG PHÁP DẠY HỌC CẦN ÁP DỤNG TRONG GIÁO ÁN:\n';
    methods.forEach(m => {
      prompt += `- **${m.name}**: ${m.description}\n`;
    });
  }

  if (techniques.length > 0) {
    prompt += '\nKĨ THUẬT DẠY HỌC CẦN SỬ DỤNG:\n';
    const grouped = new Map<string, typeof techniques>();
    techniques.forEach(t => {
      if (!grouped.has(t.groupLabel)) grouped.set(t.groupLabel, []);
      grouped.get(t.groupLabel)!.push(t);
    });
    grouped.forEach((techs, group) => {
      prompt += `\n${group}:\n`;
      techs.forEach(t => {
        prompt += `  - ${t.name}: ${t.description}\n`;
      });
    });
  }

  if (selectedActivities.length > 0) {
    prompt += '\nHOẠT ĐỘNG HỌC TẬP ĐẶC THÙ:\n';
    selectedActivities.forEach(a => {
      prompt += `- ${a}\n`;
    });
  }

  if (prompt) {
    prompt += '\nHãy tích hợp các phương pháp, kĩ thuật và hoạt động trên vào giáo án một cách TỰ NHIÊN và PHÙ HỢP với nội dung tiết dạy. Ghi rõ tên phương pháp/kĩ thuật đang sử dụng tại mỗi hoạt động.';
  }

  return prompt;
}

/**
 * Full teaching methods context for system prompt
 */
export const TEACHING_METHODS_FULL_CONTEXT = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 CƠ SỞ DỮ LIỆU PHƯƠNG PHÁP DẠY HỌC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## A. LÝ THUYẾT GIÁO DỤC CỐT LÕI

1. **Thuyết Kiến tạo (Constructivism)** - Jean Piaget, Lev Vygotsky
   Người học chủ động xây dựng kiến thức qua kinh nghiệm và tương tác.

2. **Vùng Phát triển Gần (ZPD)** - Lev Vygotsky
   Khoảng cách giữa khả năng tự học và khả năng học với hỗ trợ.

3. **Phân loại Bloom** - Benjamin Bloom
   6 cấp độ tư duy: Nhớ → Hiểu → Vận dụng → Phân tích → Đánh giá → Sáng tạo.

4. **Lý thuyết Đa trí tuệ** - Howard Gardner
   8 loại trí tuệ: Ngôn ngữ, Logic-Toán, Không gian, Âm nhạc, Vận động, Xã hội, Nội tâm, Tự nhiên.

## B. 15 PHƯƠNG PHÁP DẠY HỌC HIỆN ĐẠI

1. Dạy học theo dự án (PBL) - HS giải quyết vấn đề thực tế qua dự án
2. STEM/STEAM - Tích hợp Khoa học-Công nghệ-Kỹ thuật-Nghệ thuật-Toán
3. Lớp học đảo ngược (Flipped Classroom) - Học lý thuyết ở nhà, thực hành trên lớp
4. Dạy học hợp tác (Cooperative Learning) - HS làm việc nhóm có cấu trúc
5. Học qua trò chơi (Game-based Learning) - Gamification: điểm thưởng, bảng xếp hạng
6. Dạy học phân hóa - Điều chỉnh nội dung theo năng lực HS
7. Kỹ thuật Socratic - Câu hỏi dẫn dắt tư duy phản biện
8. Bản đồ tư duy (Mind Mapping) - Sơ đồ hóa kiến thức dạng cây
9. Học tập trải nghiệm - Học qua hoạt động thực hành
10. Kỹ thuật 5W1H - What, Why, When, Where, Who, How
11. Think-Pair-Share - Suy nghĩ cá nhân → Thảo luận cặp → Chia sẻ lớp
12. Jigsaw (Mảnh ghép) - Chia nhóm chuyên gia → ghép lại → dạy nhau
13. Gallery Walk - Trình bày sản phẩm → đi tham quan → góp ý
14. KWL - Biết gì (K) → Muốn biết (W) → Đã học (L)
15. Mô hình 5E - Engage-Explore-Explain-Elaborate-Evaluate

## C. 20 KĨ THUẬT DẠY HỌC TÍCH CỰC

### Nhóm Khởi động:
- Brainstorming, KWL, Câu hỏi kích thích tư duy, Trò chơi ô chữ/đố vui

### Nhóm Hình thành kiến thức:
- Think-Pair-Share, Jigsaw, Gallery Walk, Trạm học tập, Sơ đồ tư duy, Khăn trải bàn

### Nhóm Luyện tập:
- Bài tập phân hóa, Đánh giá đồng đẳng, Tranh luận có cấu trúc, Case Study, Role-play

### Nhóm Vận dụng:
- Dự án mini, Nhật ký học tập, Exit Ticket, Bài tập mở

## D. GIẢI PHÁP CHO HS CHƯA ĐẠT
- Phân nhóm theo năng lực, Peer Tutoring, Scaffolding, Gamification, Small Wins

## E. CÔNG CỤ EDTECH
- AI: ChatGPT, Gemini, Claude
- Tương tác: Kahoot, Quizizz, Mentimeter, Wordwall  
- Thiết kế: Canva, Genially, Prezi
- Mô phỏng: PhET, GeoGebra, Desmos
`;
