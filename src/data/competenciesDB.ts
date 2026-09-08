/**
 * Cơ sở dữ liệu Năng lực chung, Phẩm chất, Năng lực số/AI theo cấp học
 * Nguồn: Chương trình GDPT 2018 + Khung năng lực AI UNESCO + QĐ 3439/QĐ-BGDĐT 2025
 */

import { buildDigitalLiteracyPrompt } from './digitalLiteracyDB';

// ============================================
// TYPES
// ============================================

export interface CompetencyItem {
  id: string;
  name: string;
  description: string;
  manifestations: Record<string, string>; // key = nhóm lớp, value = biểu hiện
}

export interface QualityItem {
  id: string;
  name: string;
  description: string;
  manifestations: string[]; // danh sách biểu hiện
  examples: string[]; // ví dụ tích hợp vào bài học
}

// DigitalCompetencyItem đã chuyển sang digitalLiteracyDB.ts (265 YCCD, mã CB/TC/NC)

// ============================================
// 1. NĂNG LỰC CHUNG
// ============================================

const GENERAL_COMPETENCIES: Record<string, CompetencyItem[]> = {
  'Tiểu học': [
    {
      id: 'TH_NL_CHUNG_01',
      name: 'Năng lực tự chủ và tự học',
      description: 'Khả năng tự giác, chủ động trong học tập; biết đặt mục tiêu học tập phù hợp; tự tìm kiếm, tiếp nhận thông tin.',
      manifestations: {
        'Lớp 1-2': 'Làm quen với việc học tập có kế hoạch; biết chuẩn bị đồ dùng học tập; thực hiện nhiệm vụ đơn giản theo hướng dẫn.',
        'Lớp 3-5': 'Tự lập kế hoạch học tập đơn giản; tự tìm kiếm thông tin từ sách giáo khoa, sách tham khảo; tự đánh giá kết quả học tập.',
      }
    },
    {
      id: 'TH_NL_CHUNG_02',
      name: 'Năng lực giao tiếp và hợp tác',
      description: 'Khả năng lắng nghe, trình bày ý kiến; làm việc nhóm hiệu quả; tôn trọng ý kiến của người khác.',
      manifestations: {
        'Lớp 1-2': 'Biết lắng nghe và trả lời câu hỏi; làm việc theo cặp, nhóm nhỏ với sự hướng dẫn.',
        'Lớp 3-5': 'Trình bày ý kiến rõ ràng; phân công và thực hiện nhiệm vụ trong nhóm; đóng góp ý kiến xây dựng.',
      }
    },
    {
      id: 'TH_NL_CHUNG_03',
      name: 'Năng lực giải quyết vấn đề và sáng tạo',
      description: 'Khả năng nhận biết, phân tích vấn đề; đề xuất giải pháp; có tư duy sáng tạo trong học tập và cuộc sống.',
      manifestations: {
        'Lớp 1-2': 'Nhận biết vấn đề đơn giản trong học tập và sinh hoạt; giải quyết vấn đề theo hướng dẫn.',
        'Lớp 3-5': 'Phân tích vấn đề đơn giản; đề xuất cách giải quyết; có ý tưởng mới trong học tập.',
      }
    },
    {
      id: 'TH_NL_CHUNG_04',
      name: 'Năng lực ngôn ngữ',
      description: 'Khả năng sử dụng ngôn ngữ để giao tiếp, tiếp nhận và truyền đạt thông tin.',
      manifestations: {
        'Lớp 1-2': 'Đọc hiểu văn bản đơn giản; viết câu, đoạn văn ngắn; kể chuyện theo tranh.',
        'Lớp 3-5': 'Đọc hiểu nhiều loại văn bản; viết đoạn văn, bài văn ngắn; trình bày ý kiến có lập luận.',
      }
    },
  ],

  'THCS': [
    {
      id: 'THCS_NL_CHUNG_01',
      name: 'Năng lực tự chủ và tự học',
      description: 'Chủ động xác định mục tiêu, lập kế hoạch học tập; tự đánh giá và điều chỉnh phương pháp học.',
      manifestations: {
        'Lớp 6-7': 'Lập kế hoạch học tập theo tuần, tháng; tự tìm kiếm tài liệu tham khảo; tự đánh giá điểm mạnh, điểm yếu.',
        'Lớp 8-9': 'Lập kế hoạch học tập dài hạn; tự nghiên cứu chuyên sâu; điều chỉnh phương pháp học phù hợp.',
      }
    },
    {
      id: 'THCS_NL_CHUNG_02',
      name: 'Năng lực giao tiếp và hợp tác',
      description: 'Giao tiếp hiệu quả bằng nhiều hình thức; làm việc nhóm có trách nhiệm; thương lượng và giải quyết mâu thuẫn.',
      manifestations: {
        'Lớp 6-7': 'Trình bày ý kiến có lập luận; lắng nghe và phản hồi ý kiến; phân công nhiệm vụ trong nhóm.',
        'Lớp 8-9': 'Thuyết trình trước đám đông; điều phối hoạt động nhóm; giải quyết xung đột trong nhóm.',
      }
    },
    {
      id: 'THCS_NL_CHUNG_03',
      name: 'Năng lực giải quyết vấn đề và sáng tạo',
      description: 'Phân tích vấn đề đa chiều; đề xuất nhiều giải pháp; đánh giá và lựa chọn giải pháp tối ưu.',
      manifestations: {
        'Lớp 6-7': 'Phân tích nguyên nhân vấn đề; đề xuất 2-3 giải pháp; đánh giá ưu nhược điểm từng giải pháp.',
        'Lớp 8-9': 'Phân tích vấn đề phức tạp; thiết kế giải pháp sáng tạo; thực hiện và đánh giá hiệu quả.',
      }
    },
    {
      id: 'THCS_NL_CHUNG_04',
      name: 'Năng lực sử dụng CNTT và truyền thông',
      description: 'Sử dụng công nghệ thông tin để học tập, giao tiếp và giải quyết vấn đề.',
      manifestations: {
        'Lớp 6-7': 'Tìm kiếm thông tin trên Internet; sử dụng phần mềm văn phòng cơ bản; giao tiếp trực tuyến an toàn.',
        'Lớp 8-9': 'Xử lý và trình bày thông tin bằng công nghệ; đánh giá độ tin cậy của thông tin.',
      }
    },
    {
      id: 'THCS_NL_CHUNG_05',
      name: 'Năng lực tính toán',
      description: 'Sử dụng kiến thức toán học để giải quyết vấn đề trong học tập và đời sống; tư duy logic.',
      manifestations: {
        'Lớp 6-7': 'Vận dụng kiến thức toán học vào bài toán thực tế đơn giản; ước lượng và kiểm tra tính hợp lý.',
        'Lớp 8-9': 'Mô hình hóa vấn đề thực tế bằng toán học; giải quyết bài toán phức tạp; lập luận logic chặt chẽ.',
      }
    },
  ],

  'THPT': [
    {
      id: 'THPT_NL_CHUNG_01',
      name: 'Năng lực tự chủ và tự học',
      description: 'Tự định hướng nghề nghiệp và phát triển bản thân; học tập suốt đời; nghiên cứu độc lập.',
      manifestations: {
        'Lớp 10': 'Xác định mục tiêu học tập và phát triển cá nhân; lập kế hoạch chi tiết; tự nghiên cứu chuyên đề.',
        'Lớp 11': 'Định hướng nghề nghiệp; học tập có chọn lọc theo định hướng; nghiên cứu khoa học cơ bản.',
        'Lớp 12': 'Chuẩn bị cho giáo dục đại học/nghề nghiệp; nghiên cứu chuyên sâu; tự học và phát triển năng lực mới.',
      }
    },
    {
      id: 'THPT_NL_CHUNG_02',
      name: 'Năng lực giao tiếp và hợp tác',
      description: 'Giao tiếp chuyên nghiệp và hiệu quả; lãnh đạo và làm việc nhóm; giao tiếp đa văn hóa.',
      manifestations: {
        'Lớp 10': 'Thuyết trình chuyên nghiệp; tranh luận có lập luận; điều phối dự án nhóm nhỏ.',
        'Lớp 11': 'Viết báo cáo khoa học; tổ chức và điều hành hoạt động tập thể; giao tiếp với nhiều đối tượng.',
        'Lớp 12': 'Thuyết trình đề tài nghiên cứu; lãnh đạo dự án; giao tiếp trong môi trường đa văn hóa.',
      }
    },
    {
      id: 'THPT_NL_CHUNG_03',
      name: 'Năng lực giải quyết vấn đề và sáng tạo',
      description: 'Tư duy phản biện và hệ thống; giải quyết vấn đề phức tạp và liên ngành; đổi mới sáng tạo.',
      manifestations: {
        'Lớp 10': 'Phân tích vấn đề đa chiều; thiết kế giải pháp khả thi; đánh giá tác động của giải pháp.',
        'Lớp 11': 'Giải quyết vấn đề liên ngành; nghiên cứu và đề xuất giải pháp sáng tạo.',
        'Lớp 12': 'Tư duy phản biện cao; giải quyết vấn đề phức tạp trong thực tiễn; sáng tạo sản phẩm mới.',
      }
    },
    {
      id: 'THPT_NL_CHUNG_04',
      name: 'Năng lực công nghệ',
      description: 'Sử dụng thành thạo công nghệ số; lập trình và xử lý dữ liệu; an toàn và đạo đức công nghệ.',
      manifestations: {
        'Lớp 10': 'Sử dụng thành thạo công cụ số; xử lý và phân tích dữ liệu cơ bản; lập trình đơn giản.',
        'Lớp 11': 'Phát triển ứng dụng/sản phẩm công nghệ; phân tích dữ liệu nâng cao; sử dụng AI và công nghệ mới.',
        'Lớp 12': 'Thiết kế giải pháp công nghệ; nghiên cứu và ứng dụng công nghệ tiên tiến; đạo đức công nghệ.',
      }
    },
    {
      id: 'THPT_NL_CHUNG_05',
      name: 'Năng lực tài chính',
      description: 'Quản lý tài chính cá nhân; hiểu biết về kinh tế và đầu tư; ra quyết định tài chính có trách nhiệm.',
      manifestations: {
        'Lớp 10': 'Lập ngân sách cá nhân; hiểu về thu nhập và chi tiêu; tiết kiệm có kế hoạch.',
        'Lớp 11': 'Hiểu về đầu tư và rủi ro; quản lý tài chính gia đình; hiểu về thuế và bảo hiểm.',
        'Lớp 12': 'Ra quyết định tài chính; lập kế hoạch tài chính dài hạn; hiểu về kinh tế vĩ mô.',
      }
    },
    {
      id: 'THPT_NL_CHUNG_06',
      name: 'Năng lực công dân toàn cầu',
      description: 'Hiểu biết về các vấn đề toàn cầu; tôn trọng đa dạng văn hóa; trách nhiệm với cộng đồng và môi trường.',
      manifestations: {
        'Lớp 10': 'Hiểu về các vấn đề xã hội và môi trường; tham gia hoạt động cộng đồng; tôn trọng đa dạng.',
        'Lớp 11': 'Phân tích các vấn đề toàn cầu; đề xuất giải pháp bền vững; tham gia dự án xã hội.',
        'Lớp 12': 'Tư duy phát triển bền vững; hành động vì cộng đồng và môi trường; công dân toàn cầu.',
      }
    },
  ],
};

// ============================================
// 2. PHẨM CHẤT
// ============================================

const QUALITIES: Record<string, QualityItem[]> = {
  'Tiểu học': [
    {
      id: 'TH_PC_YEU_NUOC', name: 'Yêu nước',
      description: 'Yêu quý đất nước, tự hào về truyền thống dân tộc.',
      manifestations: ['Yêu quý gia đình, thầy cô, bạn bè, trường lớp', 'Biết về quê hương, đất nước Việt Nam', 'Tự hào về truyền thống dân tộc', 'Yêu tiếng Việt, tôn trọng Quốc kỳ, Quốc ca'],
      examples: ['Đọc văn bản về quê hương → cảm nhận tình yêu quê hương', 'Hát Quốc ca, ca khúc về Tổ quốc'],
    },
    {
      id: 'TH_PC_NHAN_AI', name: 'Nhân ái',
      description: 'Yêu thương con người; biết quan tâm, chia sẻ, giúp đỡ người khác.',
      manifestations: ['Yêu quý ông bà, cha mẹ, thầy cô', 'Thương yêu, giúp đỡ bạn bè', 'Quan tâm đến người khác', 'Lịch sự, nhã nhặn với mọi người'],
      examples: ['Kể chuyện về giúp đỡ người khác', 'Đọc truyện về tình bạn → cảm nhận tình thương yêu'],
    },
    {
      id: 'TH_PC_CHAN_THANH', name: 'Chân thành',
      description: 'Thật thà, trung thực; không gian dối.',
      manifestations: ['Nói thật, không nói dối', 'Thừa nhận lỗi lầm', 'Không gian lận trong học tập, thi cử', 'Giữ lời hứa'],
      examples: ['Kể chuyện về trung thực → rút bài học', 'Tự làm bài tập, không sao chép'],
    },
    {
      id: 'TH_PC_TRACH_NHIEM', name: 'Trách nhiệm',
      description: 'Ý thức làm tốt nhiệm vụ được giao.',
      manifestations: ['Làm tốt nhiệm vụ học tập', 'Giữ gìn đồ dùng học tập, tài sản chung', 'Tham gia trực nhật, vệ sinh', 'Tuân thủ nội quy'],
      examples: ['Hoàn thành bài tập đầy đủ', 'Tham gia đầy đủ các hoạt động → trách nhiệm với sức khỏe'],
    },
    {
      id: 'TH_PC_CHAM_CHI', name: 'Chăm chỉ',
      description: 'Siêng năng, cần cù trong học tập và lao động.',
      manifestations: ['Siêng năng học tập', 'Chuẩn bị bài trước, ôn bài sau', 'Kiên trì hoàn thành công việc', 'Không bỏ cuộc khi gặp khó khăn'],
      examples: ['Giải bài toán khó, không bỏ cuộc → kiên trì', 'Luyện tập đều đặn → siêng năng'],
    },
    {
      id: 'TH_PC_TU_TIN', name: 'Tự tin',
      description: 'Tin tưởng vào khả năng của bản thân; dám nghĩ, dám làm.',
      manifestations: ['Dám phát biểu ý kiến', 'Dám thử những việc mới', 'Không sợ sai, sẵn sàng học hỏi', 'Tin vào khả năng của mình'],
      examples: ['Đọc to, kể chuyện trước lớp → tự tin giao tiếp', 'Lên bảng giải bài tập → tự tin thể hiện'],
    },
  ],

  'THCS': [
    {
      id: 'THCS_PC_YEU_NUOC', name: 'Yêu nước',
      description: 'Hiểu về lịch sử, văn hóa, truyền thống dân tộc; tự hào về thành tựu của đất nước.',
      manifestations: ['Hiểu về lịch sử, văn hóa dân tộc', 'Tự hào về thành tựu đất nước', 'Tôn trọng và gìn giữ bản sắc văn hóa', 'Có ý thức bảo vệ chủ quyền lãnh thổ', 'Tham gia hoạt động xã hội có ích'],
      examples: ['Tìm hiểu các cuộc kháng chiến → tự hào dân tộc', 'Nghiên cứu tài nguyên VN → ý thức bảo vệ'],
    },
    {
      id: 'THCS_PC_NHAN_AI', name: 'Nhân ái',
      description: 'Tôn trọng, quan tâm đến mọi người; giúp đỡ người gặp khó khăn.',
      manifestations: ['Tôn trọng, quan tâm đến mọi người', 'Giúp đỡ người gặp khó khăn', 'Tôn trọng sự khác biệt về văn hóa, dân tộc', 'Bao dung, khoan dung', 'Tham gia hoạt động từ thiện'],
      examples: ['Thảo luận về quyền con người', 'Tìm hiểu đa dạng sinh học → bảo vệ thiên nhiên'],
    },
    {
      id: 'THCS_PC_CHAN_THANH', name: 'Chân thành',
      description: 'Thành thật trong lời nói và hành động; dám bảo vệ chân lý, sự thật.',
      manifestations: ['Thành thật trong lời nói và hành động', 'Không gian lận, sao chép', 'Thừa nhận và sửa chữa sai lầm', 'Dám bảo vệ chân lý', 'Giữ chữ tín', 'Tôn trọng tài sản trí tuệ'],
      examples: ['Thảo luận về trung thực → nhận thức giá trị', 'Tự giải bài tập, trích dẫn nguồn'],
    },
    {
      id: 'THCS_PC_TRACH_NHIEM', name: 'Trách nhiệm',
      description: 'Tự giác, tích cực trong học tập; có trách nhiệm trong công việc nhóm.',
      manifestations: ['Tự giác, tích cực trong học tập', 'Hoàn thành tốt nhiệm vụ được giao', 'Có trách nhiệm trong công việc nhóm', 'Giữ gìn tài sản công, bảo vệ môi trường', 'Tuân thủ pháp luật'],
      examples: ['Hoàn thành dự án nhóm đúng hạn', 'Thảo luận về quyền và nghĩa vụ'],
    },
    {
      id: 'THCS_PC_CHAM_CHI', name: 'Chăm chỉ',
      description: 'Học tập nghiêm túc, có kế hoạch; kiên trì, bền bỉ với mục tiêu.',
      manifestations: ['Học tập nghiêm túc, có kế hoạch', 'Tự học, tự nghiên cứu', 'Kiên trì, bền bỉ với mục tiêu', 'Vượt qua khó khăn', 'Không ngại khó, ngại khổ'],
      examples: ['Giải bài toán phức tạp, thử nhiều cách → kiên trì', 'Luyện tập kỹ năng đều đặn → siêng năng'],
    },
    {
      id: 'THCS_PC_TU_TIN', name: 'Tự tin',
      description: 'Tự tin trong giao tiếp, thể hiện ý kiến; biết điểm mạnh, điểm yếu.',
      manifestations: ['Tự tin trong giao tiếp', 'Dám thử thách bản thân', 'Biết điểm mạnh, điểm yếu', 'Tự tin nhưng không tự phụ', 'Vượt qua nỗi sợ thất bại'],
      examples: ['Thuyết trình, tranh luận → tự tin giao tiếp', 'Giao tiếp tiếng nước ngoài → tự tin ngôn ngữ'],
    },
  ],

  'THPT': [
    {
      id: 'THPT_PC_YEU_NUOC', name: 'Yêu nước',
      description: 'Hiểu sâu sắc về lịch sử, văn hóa; có trách nhiệm với sự phát triển của đất nước.',
      manifestations: ['Hiểu sâu sắc lịch sử, văn hóa dân tộc', 'Tự hào và trách nhiệm với đất nước', 'Bảo vệ và phát huy bản sắc văn hóa', 'Có lập trường tư tưởng vững vàng', 'Sẵn sàng cống hiến cho đất nước'],
      examples: ['Phân tích tác phẩm yêu nước → tinh thần dân tộc', 'Nghiên cứu lịch sử → tự hào và trách nhiệm'],
    },
    {
      id: 'THPT_PC_NHAN_AI', name: 'Nhân ái',
      description: 'Tôn trọng phẩm giá con người; có trách nhiệm xã hội.',
      manifestations: ['Tôn trọng phẩm giá con người', 'Có trách nhiệm xã hội', 'Chống bạo lực, phân biệt đối xử', 'Tôn trọng đa dạng văn hóa', 'Tinh thần vị tha, hy sinh', 'Bảo vệ môi trường'],
      examples: ['Nghiên cứu nhân quyền → giá trị con người', 'Nghiên cứu bảo tồn → trách nhiệm thiên nhiên'],
    },
    {
      id: 'THPT_PC_CHAN_THANH', name: 'Chân thành',
      description: 'Có lập trường vững vàng, dám bảo vệ chân lý; trung thực trong học tập, nghiên cứu.',
      manifestations: ['Có lập trường vững vàng', 'Trung thực trong học tập, nghiên cứu', 'Tôn trọng tài sản trí tuệ, không đạo văn', 'Dám nghĩ, dám nói, dám làm, dám chịu trách nhiệm', 'Có đạo đức nghề nghiệp, học thuật'],
      examples: ['Nghiên cứu và trích dẫn đúng nguồn', 'Thảo luận về đạo đức nghề nghiệp'],
    },
    {
      id: 'THPT_PC_TRACH_NHIEM', name: 'Trách nhiệm',
      description: 'Tự chủ và có trách nhiệm với học tập, nghề nghiệp; ý thức công dân.',
      manifestations: ['Tự chủ và trách nhiệm với học tập, nghề nghiệp', 'Hoàn thành xuất sắc nhiệm vụ', 'Trách nhiệm cao trong nhóm, dự án', 'Ý thức công dân, trách nhiệm xã hội', 'Bảo vệ môi trường, tài nguyên'],
      examples: ['Nghiên cứu khoa học nghiêm túc', 'Đánh giá tác động môi trường'],
    },
    {
      id: 'THPT_PC_CHAM_CHI', name: 'Chăm chỉ',
      description: 'Học tập, nghiên cứu nghiêm túc, chuyên sâu; tự học suốt đời.',
      manifestations: ['Học tập, nghiên cứu nghiêm túc, chuyên sâu', 'Tự học suốt đời', 'Kiên trì với mục tiêu dài hạn', 'Cầu tiến, không ngừng hoàn thiện', 'Có tinh thần vươn lên'],
      examples: ['Nghiên cứu chuyên đề sâu → cần cù, kiên trì', 'Luyện tập kỹ năng đều đặn → siêng năng'],
    },
    {
      id: 'THPT_PC_TU_TIN', name: 'Tự tin',
      description: 'Tự tin trong giao tiếp, thuyết trình; tự đánh giá đúng năng lực; có bản lĩnh.',
      manifestations: ['Tự tin trong giao tiếp, thuyết trình', 'Dám đưa ra ý kiến, quan điểm riêng', 'Tự đánh giá đúng năng lực bản thân', 'Tự tin nhưng khiêm tốn', 'Dám đối mặt với thử thách', 'Có bản lĩnh, không dao động'],
      examples: ['Viết và bảo vệ luận điểm → tự tin tư duy', 'Thuyết trình nghiên cứu → tự tin trình bày'],
    },
  ],
};

// ============================================
// 3. NĂNG LỰC SỐ — Dữ liệu đầy đủ nằm ở digitalLiteracyDB.ts
//    Mã hóa theo QĐ 3439: CB1/CB2 (Tiểu học), TC1/TC2 (THCS), NC1 (THPT)
// ============================================

// ============================================
// EXPORT: Hàm lấy dữ liệu theo cấp/lớp
// ============================================

export function getGeneralCompetencies(schoolLevel: string): CompetencyItem[] {
  return GENERAL_COMPETENCIES[schoolLevel] || [];
}

export function getQualities(schoolLevel: string): QualityItem[] {
  return QUALITIES[schoolLevel] || [];
}

// getDigitalAICompetencies đã được thay bởi getDigitalLiteracyForClass() trong digitalLiteracyDB.ts

/**
 * Lấy biểu hiện năng lực phù hợp với lớp cụ thể
 */
function getManifestationForClass(item: CompetencyItem, classLevel: string): string {
  // Tìm chính xác
  if (item.manifestations[classLevel]) return item.manifestations[classLevel];
  // Tìm nhóm lớp chứa lớp này
  for (const [group, text] of Object.entries(item.manifestations)) {
    if (group.includes(classLevel.replace('Lớp ', ''))) return text;
  }
  // Fallback: lấy entry đầu tiên
  const entries = Object.values(item.manifestations);
  return entries[0] || '';
}

/**
 * Phát hiện NLS (Năng lực số) trong nội dung file PPCT tải lên.
 * Trả về nội dung NLS trích xuất được (hoặc chuỗi rỗng nếu không có).
 */
export function detectNLSInReference(referenceText: string): string {
  if (!referenceText || referenceText.trim().length === 0) return '';

  const text = referenceText.toLowerCase();

  // Các pattern phát hiện NLS trong file PPCT
  const NLS_KEYWORDS = [
    'năng lực số',
    'nls',
    'digital competence',
    'khai thác dữ liệu',
    'giao tiếp và hợp tác',
    'sáng tạo nội dung số',
    'an toàn số',
    'giải quyết vấn đề',
    'ứng dụng trí tuệ nhân tạo',
    'ứng dụng ai',
  ];

  // Mã YCCD pattern: 1.1CB1a, 6.2TC2b, 5.3NC1a, etc.
  const CODE_PATTERN = /\d+\.\d+\s*(cb|tc|nc)\d+[a-d]/i;

  // Pattern: tên miền NL số + nội dung cụ thể
  const DOMAIN_PATTERN = /miền\s*(năng lực|nl)\s*\d/i;

  // Kiểm tra sự hiện diện của NLS
  const hasKeywords = NLS_KEYWORDS.some(kw => text.includes(kw));
  const hasCodes = CODE_PATTERN.test(referenceText);
  const hasDomains = DOMAIN_PATTERN.test(referenceText);

  // Cần ít nhất 1 keyword + (codes hoặc domains), hoặc nhiều keywords
  const matchCount = NLS_KEYWORDS.filter(kw => text.includes(kw)).length;
  const hasNLS = (hasKeywords && (hasCodes || hasDomains)) || matchCount >= 2;

  if (!hasNLS) return '';

  // Trích xuất đoạn chứa NLS từ file
  const lines = referenceText.split('\n');
  const nlsLines: string[] = [];
  let inNLSSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();

    // Bắt đầu section NLS
    if (
      lower.includes('năng lực số') ||
      lower.includes('nls') ||
      lower.includes('digital competence') ||
      CODE_PATTERN.test(line)
    ) {
      inNLSSection = true;
    }

    // Thu thập dòng NLS
    if (inNLSSection && line.trim()) {
      nlsLines.push(line.trim());
    }

    // Kết thúc section (gặp phần mới không liên quan)
    if (inNLSSection && nlsLines.length > 2) {
      const isNewSection = lower.match(/^(i+\.|[ivx]+\.|phần|\d+\.\s*(kiến thức|kỹ năng|thái độ|mục tiêu|tiến trình))/i);
      if (isNewSection && !lower.includes('năng lực số')) {
        break;
      }
    }
  }

  return nlsLines.join('\n');
}

/**
 * Xây dựng prompt năng lực + phẩm chất cho AI
 * Được inject vào prompt khi sinh giáo án
 * @param referenceText - Nội dung file PPCT tải lên (tùy chọn). Nếu có NLS trong file → ưu tiên tuyệt đối.
 */
export function buildCompetenciesPrompt(schoolLevel: string, classLevel: string, referenceText?: string): string {
  if (!schoolLevel) return '';

  const parts: string[] = [];

  // 1. Năng lực chung
  const generalComps = getGeneralCompetencies(schoolLevel);
  if (generalComps.length > 0) {
    parts.push('## NĂNG LỰC CHUNG CẦN PHÁT TRIỂN');
    parts.push(`Cấp học: ${schoolLevel} | Lớp: ${classLevel}`);
    parts.push('Chọn 2-4 năng lực chung phù hợp nhất với nội dung bài học:');
    generalComps.forEach(c => {
      const manifestation = getManifestationForClass(c, classLevel);
      parts.push(`- **${c.name}**: ${c.description}`);
      parts.push(`  Biểu hiện ${classLevel}: ${manifestation}`);
    });
  }

  // 2. Phẩm chất
  const qualities = getQualities(schoolLevel);
  if (qualities.length > 0) {
    parts.push('\n## PHẨM CHẤT CẦN HÌNH THÀNH');
    parts.push('Chọn 2-3 phẩm chất phù hợp nhất:');
    qualities.forEach(q => {
      parts.push(`- **${q.name}**: ${q.manifestations.slice(0, 3).join('; ')}`);
    });
  }

  // 3. Năng lực số (NLS) — Ưu tiên từ file PPCT tải lên
  const nlsFromFile = referenceText ? detectNLSInReference(referenceText) : '';

  if (nlsFromFile) {
    // ✅ File PPCT ĐÃ CÓ NLS → dùng NGHIÊM NGẶT từ file, bỏ qua DB
    parts.push('\n## ⚠️ NĂNG LỰC SỐ (NLS) - TỪ FILE PHÂN PHỐI CHƯƠNG TRÌNH TẢI LÊN');
    parts.push('🔴 NGHIÊM NGẶT: File kế hoạch bài dạy/PPCT đã chứa Năng lực số cụ thể.');
    parts.push('BẠN PHẢI sử dụng CHÍNH XÁC nội dung NLS dưới đây, KHÔNG được thay đổi, thêm bớt hay tự ý bổ sung NLS khác.');
    parts.push('');
    parts.push('NỘI DUNG NLS TỪ FILE:');
    parts.push(nlsFromFile);
    parts.push('');
    parts.push('QUY TẮC BẮT BUỘC:');
    parts.push('- Trích xuất CHÍNH XÁC năng lực số từ nội dung trên');
    parts.push('- KHÔNG thêm năng lực số ngoài phạm vi file đã cung cấp');
    parts.push('- KHÔNG tự ý thay thế bằng NLS từ cơ sở dữ liệu mặc định');
    parts.push('- Nếu file có mã YCCD (ví dụ: 1.1CB1a) → giữ nguyên mã đó');
    parts.push('- Tích hợp NLS từ file vào các hoạt động dạy học MỘT CÁCH TỰ NHIÊN');
  } else {
    // File không có NLS → dùng DB mặc định
    const nlsPrompt = buildDigitalLiteracyPrompt(schoolLevel, classLevel);
    if (nlsPrompt) {
      parts.push('\n' + nlsPrompt);
    }
  }

  // 4. Hướng dẫn chung
  parts.push('\n## HƯỚNG DẪN TÍCH HỢP');
  parts.push('- Năng lực chung + phẩm chất PHẢI xuất hiện trong phần MỤC TIÊU của giáo án');
  parts.push('- Mỗi năng lực phải gắn với hoạt động cụ thể có thể quan sát và đánh giá');
  parts.push('- Phẩm chất phải được tích hợp TỰ NHIÊN qua hoạt động, không gượng ép');
  if (nlsFromFile) {
    parts.push('- 🔴 NLS: Dùng CHÍNH XÁC từ file tải lên — KHÔNG thay đổi, KHÔNG bổ sung');
  } else {
    parts.push('- Năng lực số (NLS) chỉ tích hợp khi PHÙ HỢP với nội dung bài học');
    parts.push('- Ghi rõ MÃ YCCD khi tích hợp NLS (ví dụ: 1.1CB1a, 6.2TC1b)');
  }

  return parts.join('\n');
}
