/**
 * Cơ sở dữ liệu Năng lực số (NLS) đầy đủ
 * Nguồn: Ma hoa NLS.xlsx - QĐ 3439/QĐ-BGDĐT 2025
 * Hệ thống mã hóa:
 *   CB1 = Cơ bản 1 (Tiểu học lớp 1-3)
 *   CB2 = Cơ bản 2 (Tiểu học lớp 4-5)
 *   TC1 = Trung cấp 1 (THCS lớp 6-7)
 *   TC2 = Trung cấp 2 (THCS lớp 8-9)
 *   NC1 = Nâng cao 1 (THPT lớp 10-12)
 * 6 miền NL, 25 NL thành phần, 265 YCCD
 */

export type NLSLevel = 'CB1' | 'CB2' | 'TC1' | 'TC2' | 'NC1';

export interface NLSRequirement {
  id: string;
  indicator: string; // a, b, c, d
  requirement: string; // YCCD
}

export interface NLSSubCompetency {
  domain: string;
  subName: string;
  content: string;
  items: NLSRequirement[];
}

// Mapping cấp học → mức NLS
export function getNLSLevelsForSchool(schoolLevel: string, classLevel: string): NLSLevel[] {
  const classNum = parseInt(classLevel.replace(/\D/g, '')) || 0;
  switch (schoolLevel) {
    case 'Tiểu học':
      return classNum <= 3 ? ['CB1'] : ['CB2'];
    case 'THCS':
      return classNum <= 7 ? ['TC1'] : ['TC2'];
    case 'THPT':
      // THPT dùng cả TC2 (cho nội dung cơ bản) và NC1 (cho nâng cao)
      return ['TC2', 'NC1'];
    default:
      return ['CB1'];
  }
}

// Dữ liệu NLS theo mức
export const NLS_DATABASE: Record<NLSLevel, Record<string, NLSSubCompetency>> = {
  'CB1': {
    '1.1': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số',
      content: 'Xác định được nhu cầu thông tin; tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số; truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm.',
      items: [
        { id: '1.1CB1a', indicator: 'a', requirement: 'Xác định được nhu cầu thông tin, tìm kiếm dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số.' },
        { id: '1.1CB1b', indicator: 'b', requirement: 'Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.' },
        { id: '1.1CB1c', indicator: 'c', requirement: 'Xác định được các chiến lược tìm kiếm đơn giản.' },
      ],
    },
    '1.2': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.2. Đánh giá dữ liệu, thông tin và nội dung số',
      content: 'Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số.',
      items: [
        { id: '1.2CB1a', indicator: 'a', requirement: 'Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '1.3': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.3. Quản lý dữ liệu, thông tin và nội dung số',
      content: 'Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc.',
      items: [
        { id: '1.3CB1a', indicator: 'a', requirement: 'Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số.' },
        { id: '1.3CB1b', indicator: 'b', requirement: 'Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc.' },
      ],
    },
    '2.1': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.1. Tương tác thông qua công nghệ số',
      content: 'Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số nào phù hợp cho một bối cảnh nhất định.',
      items: [
        { id: '2.1CB1a', indicator: 'a', requirement: 'Lựa chọn được các công nghệ số đơn giản để tương tác.' },
        { id: '2.1CB1b', indicator: 'b', requirement: 'Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể.' },
      ],
    },
    '2.2': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số',
      content: 'Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết và thực hành trích dẫn và ghi chú nguồn.',
      items: [
        { id: '2.2CB1a', indicator: 'a', requirement: 'Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung kỹ thuật số.' },
        { id: '2.2CB1b', indicator: 'b', requirement: 'Nhận biết được phương pháp trích dẫn và ghi nguồn cơ bản.' },
      ],
    },
    '2.3': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân',
      content: 'Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội, để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp.',
      items: [
        { id: '2.3CB1a', indicator: 'a', requirement: 'Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội.' },
        { id: '2.3CB1b', indicator: 'b', requirement: 'Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân.' },
      ],
    },
    '2.4': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.4. Hợp tác thông qua công nghệ số',
      content: 'Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức.',
      items: [
        { id: '2.4CB1a', indicator: 'a', requirement: 'Chọn được những công cụ và công nghệ số đơn giản cho các quá trình cộng tác.' },
      ],
    },
    '2.5': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.5. Quy tắc ứng xử trên mạng',
      content: 'Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số.  Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức đa dạng về văn hóa và thế hệ trong môi trường số.',
      items: [
        { id: '2.5CB1a', indicator: 'a', requirement: 'Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số.' },
        { id: '2.5CB1b', indicator: 'b', requirement: 'Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số.' },
        { id: '2.5CB1c', indicator: 'c', requirement: 'Phân biệt các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số.' },
      ],
    },
    '2.6': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.6. Quản lý danh tính số',
      content: 'Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số.',
      items: [
        { id: '2.6CB1a', indicator: 'a', requirement: 'Xác định được danh tính số.' },
        { id: '2.6CB1b', indicator: 'b', requirement: 'Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân.' },
        { id: '2.6CB1c', indicator: 'c', requirement: 'Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số.' },
      ],
    },
    '3.1': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.1 Phát triển nội dung số',
      content: 'Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số.',
      items: [
        { id: '3.1CB1a', indicator: 'a', requirement: 'Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.' },
        { id: '3.1CB1b', indicator: 'b', requirement: 'Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.' },
      ],
    },
    '3.2': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.2. Tích hợp và tạo lập lại nội dung số',
      content: 'Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp.',
      items: [
        { id: '3.2CB1a', indicator: 'a', requirement: 'Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo.' },
      ],
    },
    '3.3': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.3. Thực thi bản quyền và giấy phép',
      content: 'Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số',
      items: [
        { id: '3.3CB1a', indicator: 'a', requirement: 'Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '3.4': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.4. Lập trình',
      content: 'Lập được kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.',
      items: [
        { id: '3.4CB1a', indicator: 'a', requirement: 'Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.' },
      ],
    },
    '4.1': {
      domain: '4. An toàn',
      subName: '4.1. Bảo vệ thiết bị',
      content: 'Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và  bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư.',
      items: [
        { id: '4.1CB1a', indicator: 'a', requirement: 'Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.' },
        { id: '4.1CB1b', indicator: 'b', requirement: 'Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số.' },
        { id: '4.1CB1c', indicator: 'c', requirement: 'Chọn lựa được các biện pháp an toàn và bảo mật đơn giản.' },
        { id: '4.1CB1d', indicator: 'd', requirement: 'Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư.' },
      ],
    },
    '4.2': {
      domain: '4. An toàn',
      subName: '4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư',
      content: 'Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng “Chính sách Quyền riêng tư” để thông báo phương thức sử dụng dữ liệu cá nhân.',
      items: [
        { id: '4.2CB1a', indicator: 'a', requirement: 'Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.' },
        { id: '4.2CB1b', indicator: 'b', requirement: 'Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác.' },
        { id: '4.2CB1c', indicator: 'c', requirement: 'Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số.' },
      ],
    },
    '4.3': {
      domain: '4. An toàn',
      subName: '4.3 Bảo vệ sức khỏe và an sinh số',
      content: 'Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.',
      items: [
        { id: '4.3CB1a', indicator: 'a', requirement: 'Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.' },
        { id: '4.3CB1b', indicator: 'b', requirement: 'Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.' },
        { id: '4.3CB1c', indicator: 'c', requirement: 'Nhận biết được những công nghệ số đơn giản cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.' },
      ],
    },
    '4.4': {
      domain: '4. An toàn',
      subName: '4.4 Bảo vệ môi trường',
      content: 'Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường.',
      items: [
        { id: '4.4CB1a', indicator: 'a', requirement: 'Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường.' },
      ],
    },
    '5.1': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.1. Giải quyết các vấn đề kỹ thuật',
      content: 'Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn).',
      items: [
        { id: '5.1CB1a', indicator: 'a', requirement: 'Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số.' },
        { id: '5.1CB1b', indicator: 'b', requirement: 'Xác định được các giải pháp đơn giản để giải quyết chúng.' },
      ],
    },
    '5.2': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.2 Xác định nhu cầu và giải pháp công nghệ',
      content: 'Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận).',
      items: [
        { id: '5.2CB1a', indicator: 'a', requirement: 'Xác định được nhu cầu cá nhân.' },
        { id: '5.2CB1b', indicator: 'b', requirement: 'Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.' },
        { id: '5.2CB1c', indicator: 'c', requirement: 'Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.' },
      ],
    },
    '5.3': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.3 Sử dụng sáng tạo công nghệ số',
      content: 'Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số.',
      items: [
        { id: '5.3CB1a', indicator: 'a', requirement: 'Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm.' },
        { id: '5.3CB1b', indicator: 'b', requirement: 'Thể hiện được sự quan tâm của cá nhân và tập thể đến quá trình xử lý nhận thức đơn giản để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số.' },
      ],
    },
    '5.4': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.4 Xác định các vấn đề cần cải thiện về NLS',
      content: 'Hiểu được NLS của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển NLS của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số.',
      items: [
        { id: '5.4CB1a', indicator: 'a', requirement: 'Nhận ra được NLS của tôi cần được cải thiện hoặc cập nhật ở đâu.' },
        { id: '5.4CB1b', indicator: 'b', requirement: 'Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển công nghệ số.' },
      ],
    },
    '6.2': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.2 Sử dụng trí tuệ nhân tạo',
      content: 'Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hàng ngày.',
      items: [
        { id: '6.2CB1a', indicator: 'a', requirement: 'Nhận diện được các công cụ AI đơn giản.' },
        { id: '6.2CB1b', indicator: 'b', requirement: 'Thực hiện được các thao tác cơ bản với các công cụ AI.' },
        { id: '6.2CB1c', indicator: 'c', requirement: 'Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI.' },
      ],
    },
    '6.3': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.3 Đánh giá trí tuệ nhân tạo',
      content: 'Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động.',
      items: [
        { id: '6.3CB1a', indicator: 'a', requirement: 'Nhận diện được một số vật dụng/trò chơi thông minh có sử dụng AI.' },
        { id: '6.3CB1b', indicator: 'b', requirement: 'Nhớ được rằng không phải mọi thông tin từ máy móc đều đúng.' },
      ],
    },
  },
  'CB2': {
    '1.1': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số',
      content: 'Xác định được nhu cầu thông tin; tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số; truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm.',
      items: [
        { id: '1.1CB2a', indicator: 'a', requirement: 'Xác định được nhu cầu thông tin.' },
        { id: '1.1CB2b', indicator: 'b', requirement: 'Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số.' },
        { id: '1.1CB2c', indicator: 'c', requirement: 'Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.' },
        { id: '1.1CB2d', indicator: 'd', requirement: 'Xác định được các chiến lược tìm kiếm đơn giản.' },
      ],
    },
    '1.2': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.2. Đánh giá dữ liệu, thông tin và nội dung số',
      content: 'Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số.',
      items: [
        { id: '1.2CB2a', indicator: 'a', requirement: 'Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '1.3': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.3. Quản lý dữ liệu, thông tin và nội dung số',
      content: 'Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc.',
      items: [
        { id: '1.3CB2a', indicator: 'a', requirement: 'Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số.' },
        { id: '1.3CB2b', indicator: 'b', requirement: 'Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc.' },
      ],
    },
    '2.1': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.1. Tương tác thông qua công nghệ số',
      content: 'Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số nào phù hợp cho một bối cảnh nhất định.',
      items: [
        { id: '2.1CB2a', indicator: 'a', requirement: 'Lựa chọn được các công nghệ số đơn giản để tương tác.' },
        { id: '2.1CB2b', indicator: 'b', requirement: 'Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể.' },
      ],
    },
    '2.2': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số',
      content: 'Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết và thực hành trích dẫn và ghi chú nguồn.',
      items: [
        { id: '2.2CB2a', indicator: 'a', requirement: 'Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung kỹ thuật số.' },
        { id: '2.2CB2b', indicator: 'b', requirement: 'Xác định được phương pháp trích dẫn và ghi nguồn cơ bản.' },
      ],
    },
    '2.3': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân',
      content: 'Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội, để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp.',
      items: [
        { id: '2.3CB2a', indicator: 'a', requirement: 'Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội.' },
        { id: '2.3CB2b', indicator: 'b', requirement: 'Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân.' },
      ],
    },
    '2.4': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.4. Hợp tác thông qua công nghệ số',
      content: 'Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức.',
      items: [
        { id: '2.4CB2a', indicator: 'a', requirement: 'Chọn được những công cụ và công nghệ số đơn giản cho các quá trình cộng tác.' },
      ],
    },
    '2.5': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.5. Quy tắc ứng xử trên mạng',
      content: 'Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số.  Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức đa dạng về văn hóa và thế hệ trong môi trường số.',
      items: [
        { id: '2.5CB2a', indicator: 'a', requirement: 'Phân biệt được các chuẩn mực hành vi đơn giản và bí quyết sử dụng công nghệ số và tương tác trong môi trường số.' },
        { id: '2.5CB2b', indicator: 'b', requirement: 'Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số.' },
        { id: '2.5CB2c', indicator: 'c', requirement: 'Phân biệt các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số.' },
      ],
    },
    '2.6': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.6. Quản lý danh tính số',
      content: 'Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số.',
      items: [
        { id: '2.6CB2a', indicator: 'a', requirement: 'Xác định được danh tính số.' },
        { id: '2.6CB2b', indicator: 'b', requirement: 'Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân.' },
        { id: '2.6CB2c', indicator: 'c', requirement: 'Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số.' },
      ],
    },
    '3.1': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.1 Phát triển nội dung số',
      content: 'Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số.',
      items: [
        { id: '3.1CB2a', indicator: 'a', requirement: 'Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.' },
        { id: '3.1CB2b', indicator: 'b', requirement: 'Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản.' },
      ],
    },
    '3.2': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.2. Tích hợp và tạo lập lại nội dung số',
      content: 'Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp.',
      items: [
        { id: '3.2CB2a', indicator: 'a', requirement: 'Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo.' },
      ],
    },
    '3.3': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.3. Thực thi bản quyền và giấy phép',
      content: 'Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số',
      items: [
        { id: '3.3CB2a', indicator: 'a', requirement: 'Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '3.4': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.4. Lập trình',
      content: 'Lập được kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.',
      items: [
        { id: '3.4CB2a', indicator: 'a', requirement: 'Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản.' },
      ],
    },
    '4.1': {
      domain: '4. An toàn',
      subName: '4.1. Bảo vệ thiết bị',
      content: 'Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và  bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư.',
      items: [
        { id: '4.1CB2a', indicator: 'a', requirement: 'Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.' },
        { id: '4.1CB2b', indicator: 'b', requirement: 'Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số.' },
        { id: '4.1CB2c', indicator: 'c', requirement: 'Tuân theo được các biện pháp an toàn và bảo mật đơn giản.' },
        { id: '4.1CB2d', indicator: 'd', requirement: 'Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư.' },
      ],
    },
    '4.2': {
      domain: '4. An toàn',
      subName: '4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư',
      content: 'Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng “Chính sách Quyền riêng tư” để thông báo phương thức sử dụng dữ liệu cá nhân.',
      items: [
        { id: '4.2CB2a', indicator: 'a', requirement: 'Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.' },
        { id: '4.2CB2b', indicator: 'b', requirement: 'Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác.' },
        { id: '4.2CB2c', indicator: 'c', requirement: 'Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số.' },
      ],
    },
    '4.3': {
      domain: '4. An toàn',
      subName: '4.3 Bảo vệ sức khỏe và an sinh số',
      content: 'Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.',
      items: [
        { id: '4.3CB2a', indicator: 'a', requirement: 'Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.' },
        { id: '4.3CB2b', indicator: 'b', requirement: 'Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.' },
        { id: '4.3CB2c', indicator: 'c', requirement: 'Nhận biết được những công nghệ số đơn giản cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.' },
      ],
    },
    '4.4': {
      domain: '4. An toàn',
      subName: '4.4 Bảo vệ môi trường',
      content: 'Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường.',
      items: [
        { id: '4.4CB2a', indicator: 'a', requirement: 'Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường.' },
      ],
    },
    '5.1': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.1. Giải quyết các vấn đề kỹ thuật',
      content: 'Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn).',
      items: [
        { id: '5.1CB2a', indicator: 'a', requirement: 'Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số.' },
        { id: '5.1CB2b', indicator: 'b', requirement: 'Xác định được các giải pháp đơn giản để giải quyết chúng.' },
      ],
    },
    '5.2': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.2 Xác định nhu cầu và giải pháp công nghệ',
      content: 'Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận).',
      items: [
        { id: '5.2CB2a', indicator: 'a', requirement: 'Xác định được nhu cầu cá nhân.' },
        { id: '5.2CB2b', indicator: 'b', requirement: 'Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.' },
        { id: '5.2CB2c', indicator: 'c', requirement: 'Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.' },
      ],
    },
    '5.3': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.3 Sử dụng sáng tạo công nghệ số',
      content: 'Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số.',
      items: [
        { id: '5.3CB2a', indicator: 'a', requirement: 'Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm.' },
        { id: '5.3CB2b', indicator: 'b', requirement: 'Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số.' },
      ],
    },
    '5.4': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.4 Xác định các vấn đề cần cải thiện về NLS',
      content: 'Hiểu được NLS của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển NLS của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số.',
      items: [
        { id: '5.4CB2a', indicator: 'a', requirement: 'Nhận ra được NLS của tôi cần được cải thiện hoặc cập nhật ở đâu.' },
        { id: '5.4CB2b', indicator: 'b', requirement: 'Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển công nghệ số.' },
      ],
    },
    '6.1': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.1 Hiểu biết về trí tuệ nhân tạo',
      content: 'Hiểu được cách AI ảnh hưởng đến cuộc sống hàng ngày và vai trò của Al trong các lĩnh vực khác nhau. Nắm vững được nguyên tắc hoạt động của AI, khả năng và hạn chế của AI.',
      items: [
        { id: '6.1CB2a', indicator: 'a', requirement: 'Xác định được các khái niệm cơ bản của AI.' },
        { id: '6.1CB2b', indicator: 'b', requirement: 'Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hàng ngày.' },
      ],
    },
    '6.2': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.2 Sử dụng trí tuệ nhân tạo',
      content: 'Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hàng ngày.',
      items: [
        { id: '6.2CB2a', indicator: 'a', requirement: 'Áp dụng được các công cụ AI để giải quyết vấn đề đơn giản.' },
        { id: '6.2CB2b', indicator: 'b', requirement: 'Tương tác được với các hệ thống AI cơ bản.' },
        { id: '6.2CB2c', indicator: 'c', requirement: 'Tuân thủ các quy định pháp luật cơ bản khi sử dụng AI.' },
      ],
    },
    '6.3': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.3 Đánh giá trí tuệ nhân tạo',
      content: 'Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động.',
      items: [
        { id: '6.3CB2a', indicator: 'a', requirement: 'Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá.' },
        { id: '6.3CB2b', indicator: 'b', requirement: 'Mô tả được các chức năng chính của hệ thống AI.' },
      ],
    },
  },
  'TC1': {
    '1.1': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số',
      content: 'Xác định được nhu cầu thông tin; tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số; truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm.',
      items: [
        { id: '1.1TC1a', indicator: 'a', requirement: 'Giải thích được nhu cầu thông tin.' },
        { id: '1.1TC1b', indicator: 'b', requirement: 'Thực hiện được rõ ràng và theo quy trình các tìm kiếm để tìm dữ liệu, thông tin và nội dung trong môi trường số.' },
        { id: '1.1TC1c', indicator: 'c', requirement: 'Giải thích được cách truy cập và điều hướng các kết quả tìm kiếm.' },
        { id: '1.1TC1d', indicator: 'd', requirement: 'Giải thích được rõ ràng và theo quy trình chiến lược tìm kiếm.' },
      ],
    },
    '1.2': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.2. Đánh giá dữ liệu, thông tin và nội dung số',
      content: 'Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số.',
      items: [
        { id: '1.2TC1a', indicator: 'a', requirement: 'Thực hiện phân tích, so sánh, đánh giá được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số đã được tổ chức rõ ràng.' },
        { id: '1.2TC1b', indicator: 'b', requirement: 'Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số được xác định rõ ràng.' },
      ],
    },
    '1.3': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.3. Quản lý dữ liệu, thông tin và nội dung số',
      content: 'Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc.',
      items: [
        { id: '1.3TC1a', indicator: 'a', requirement: 'Lựa chọn được dữ liệu, thông tin và nội dung để tổ chức, lưu trữ và truy xuất chúng một cách thường xuyên trong môi trường số.' },
        { id: '1.3TC1b', indicator: 'b', requirement: 'Sắp xếp chúng một cách trật tự trong một môi trường có cấu trúc.' },
      ],
    },
    '2.1': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.1. Tương tác thông qua công nghệ số',
      content: 'Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số nào phù hợp cho một bối cảnh nhất định.',
      items: [
        { id: '2.1TC1a', indicator: 'a', requirement: 'Thực hiện được các tương tác được xác định rõ ràng và thường xuyên với các công nghệ số.' },
        { id: '2.1TC1b', indicator: 'b', requirement: 'Lựa chọn được các phương tiện giao tiếp số phù hợp, được xác định rõ ràng cho phù hợp với bối cảnh nhất định.' },
      ],
    },
    '2.2': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số',
      content: 'Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết và thực hành trích dẫn và ghi chú nguồn.',
      items: [
        { id: '2.2TC1a', indicator: 'a', requirement: 'Lựa chọn các công nghệ số phù hợp được xác định rõ để trao đổi dữ liệu, thông tin và nội dung số.' },
        { id: '2.2TC1b', indicator: 'b', requirement: 'Giải thích cách thức hoạt động như một trung gian để chia sẻ thông tin và nội dung thông qua các công nghệ kỹ thuật số được xác định rõ ràng và thường xuyên.' },
        { id: '2.2TC1c', indicator: 'c', requirement: 'Minh họa rõ ràng và thường xuyên các phương pháp tham chiếu và ghi chú nguồn.' },
      ],
    },
    '2.3': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân',
      content: 'Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội, để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp.',
      items: [
        { id: '2.3TC1a', indicator: 'a', requirement: 'Lựa chọn được các dịch vụ số được xác định rõ ràng và phổ biến để tham gia vào xã hội.' },
        { id: '2.3TC1b', indicator: 'b', requirement: 'Xác định được các công nghệ số rõ ràng và thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân.' },
      ],
    },
    '2.4': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.4. Hợp tác thông qua công nghệ số',
      content: 'Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức.',
      items: [
        { id: '2.4TC1a', indicator: 'a', requirement: 'Lựa chọn được các công cụ và công nghệ số được xác định rõ ràng và thường xuyên cho các quá trình hợp tác.' },
      ],
    },
    '2.5': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.5. Quy tắc ứng xử trên mạng',
      content: 'Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số.  Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức đa dạng về văn hóa và thế hệ trong môi trường số.',
      items: [
        { id: '2.5TC1a', indicator: 'a', requirement: 'Làm rõ được các chuẩn mực hành vi thường xuyên và được xác định rõ ràng cũng như bí quyết khi sử dụng công nghệ số và tương tác trong môi trường số.' },
        { id: '2.5TC1b', indicator: 'b', requirement: 'Thể hiện được các chiến lược giao tiếp thường xuyên và xác định rõ ràng phương thức giao tiếp phù hợp trong môi trường số.' },
        { id: '2.5TC1c', indicator: 'c', requirement: 'Mô tả các khía cạnh đa dạng về văn hóa và thế hệ được xác định rõ ràng và thông thường cần xem xét trong môi trường số.' },
      ],
    },
    '2.6': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.6. Quản lý danh tính số',
      content: 'Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số.',
      items: [
        { id: '2.6TC1a', indicator: 'a', requirement: 'Phân biệt được một loạt các danh tính số thông thường và được xác định rõ ràng.' },
        { id: '2.6TC1b', indicator: 'b', requirement: 'Giải thích được những cách được xác định rõ ràng và thường xuyên để bảo vệ danh tiếng trực tuyến của bản thân.' },
        { id: '2.6TC1c', indicator: 'c', requirement: 'Mô tả dữ liệu được xác định rõ ràng mà bạn thường xuyên thu được thông qua các công cụ, môi trường hoặc dịch vụ số.' },
      ],
    },
    '3.1': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.1 Phát triển nội dung số',
      content: 'Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số.',
      items: [
        { id: '3.1TC1a', indicator: 'a', requirement: 'Chỉ ra được cách tạo và chỉnh sửa nội dung có khái niệm cụ thể và mang tính phổ thông bằng những định dạng rõ ràng, phổ biến.' },
        { id: '3.1TC1b', indicator: 'b', requirement: 'Thể hiện được bản thân thông qua việc tạo ra các nội dung số thông thường và được xác định rõ ràng.' },
      ],
    },
    '3.2': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.2. Tích hợp và tạo lập lại nội dung số',
      content: 'Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp.',
      items: [
        { id: '3.2TC1a', indicator: 'a', requirement: 'Giải thích được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục nội dung và thông tin mới được xác định rõ ràng để tạo ra những nội dung và thông tin mới và độc đáo.' },
      ],
    },
    '3.3': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.3. Thực thi bản quyền và giấy phép',
      content: 'Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số',
      items: [
        { id: '3.3TC1a', indicator: 'a', requirement: 'Chỉ ra được các quy tắc thông thường và được xác định rõ ràng về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '3.4': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.4. Lập trình',
      content: 'Lập được kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.',
      items: [
        { id: '3.4TC1a', indicator: 'a', requirement: 'Liệt kê được các hướng dẫn thông thường và được xác định rõ ràng cho một hệ thống máy tính để giải quyết các vấn đề thường ngày hoặc thực hiện các tác vụ thường ngày.' },
      ],
    },
    '4.1': {
      domain: '4. An toàn',
      subName: '4.1. Bảo vệ thiết bị',
      content: 'Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và  bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư.',
      items: [
        { id: '4.1TC1a', indicator: 'a', requirement: 'Chỉ ra được những cách thức cơ bản và phổ biến để bảo vệ thiết bị và nội dung số.' },
        { id: '4.1TC1b', indicator: 'b', requirement: 'Phân biệt được những rủi ro và mối đe dọa cơ bản và phổ biến trong môi trường số.' },
        { id: '4.1TC1c', indicator: 'c', requirement: 'Chọn lựa được các biện pháp an toàn và bảo mật rõ ràng và thường xuyên.' },
        { id: '4.1TC1d', indicator: 'd', requirement: 'Chỉ ra được những cách thức cơ bản và phổ biến để quan tâm đến mức độ tin cậy và quyền riêng tư.' },
      ],
    },
    '4.2': {
      domain: '4. An toàn',
      subName: '4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư',
      content: 'Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng “Chính sách Quyền riêng tư” để thông báo phương thức sử dụng dữ liệu cá nhân.',
      items: [
        { id: '4.2TC1a', indicator: 'a', requirement: 'Giải thích được các cách thức cơ bản và phổ biến để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.' },
        { id: '4.2TC1b', indicator: 'b', requirement: 'Giải thích được các cách thức cơ bản và phổ biến để sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn.' },
        { id: '4.2TC1c', indicator: 'c', requirement: 'Chỉ ra được các tuyên bố cơ bản và phổ biến trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số.' },
      ],
    },
    '4.3': {
      domain: '4. An toàn',
      subName: '4.3 Bảo vệ sức khỏe và an sinh số',
      content: 'Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.',
      items: [
        { id: '4.3TC1a', indicator: 'a', requirement: 'Giải thích được những cách thức cơ bản và phổ biến để tránh rủi ro và đe dọa đối với sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.' },
        { id: '4.3TC1b', indicator: 'b', requirement: 'Lựa chọn được những cách thức cơ bản và phổ biến để bảo vệ bản thân khỏi nguy cơ trong môi trường số.' },
        { id: '4.3TC1c', indicator: 'c', requirement: 'Chỉ ra được những công nghệ số cơ bản và phổ biến giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.' },
      ],
    },
    '4.4': {
      domain: '4. An toàn',
      subName: '4.4 Bảo vệ môi trường',
      content: 'Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường.',
      items: [
        { id: '4.4TC1a', indicator: 'a', requirement: 'Chỉ ra được những tác động cơ bản và phổ biến của công nghệ số và việc sử dụng công nghệ số đối với môi trường.' },
      ],
    },
    '5.1': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.1. Giải quyết các vấn đề kỹ thuật',
      content: 'Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn).',
      items: [
        { id: '5.1TC1a', indicator: 'a', requirement: 'Chỉ ra được các vấn đề kỹ thuật thông thường và được xác định rõ ràng khi vận hành thiết bị và sử dụng môi trường số.' },
        { id: '5.1TC1b', indicator: 'b', requirement: 'Chọn được các giải pháp được xác định rõ ràng và thông thường cho chúng.' },
      ],
    },
    '5.2': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.2 Xác định nhu cầu và giải pháp công nghệ',
      content: 'Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận).',
      items: [
        { id: '5.2TC1a', indicator: 'a', requirement: 'Chỉ ra được những nhu cầu được xác định rõ ràng và thường xuyên.' },
        { id: '5.2TC1b', indicator: 'b', requirement: 'Chọn được các công cụ số thông thường và được xác định rõ ràng cũng như các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.' },
        { id: '5.2TC1c', indicator: 'c', requirement: 'Chọn được những cách thông thường và được xác định rõ ràng để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.' },
      ],
    },
    '5.3': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.3 Sử dụng sáng tạo công nghệ số',
      content: 'Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số.',
      items: [
        { id: '5.3TC1a', indicator: 'a', requirement: 'Chọn được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức rõ ràng cũng như các quy trình và sản phẩm đổi mới được xác định rõ ràng.' },
        { id: '5.3TC1b', indicator: 'b', requirement: 'Gắn kết được cá nhân và tập thể vào một số quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và tình huống có vấn đề thông thường và được xác định rõ ràng trong môi trường số.' },
      ],
    },
    '5.4': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.4 Xác định các vấn đề cần cải thiện về NLS',
      content: 'Hiểu được NLS của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển NLS của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số.',
      items: [
        { id: '5.4TC1a', indicator: 'a', requirement: 'Giải thích được NLS của bản thân cần được cải thiện hoặc cập nhật ở đâu.' },
        { id: '5.4TC1b', indicator: 'b', requirement: 'Chỉ ra được nơi để tìm kiếm các cơ hội được xác định rõ ràng để phát triển bản thân và cập nhật sự phát triển công nghệ số.' },
      ],
    },
    '6.1': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.1 Hiểu biết về trí tuệ nhân tạo',
      content: 'Hiểu được cách AI ảnh hưởng đến cuộc sống hàng ngày và vai trò của Al trong các lĩnh vực khác nhau. Nắm vững được nguyên tắc hoạt động của AI, khả năng và hạn chế của AI.',
      items: [
        { id: '6.1TC1a', indicator: 'a', requirement: 'Giải thích được nguyên tắc hoạt động cơ bản của AI.' },
        { id: '6.1TC1b', indicator: 'b', requirement: 'Diễn giải được các thuật ngữ và khái niệm liên quan đến AI.' },
      ],
    },
    '6.2': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.2 Sử dụng trí tuệ nhân tạo',
      content: 'Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hàng ngày.',
      items: [
        { id: '6.2TC1a', indicator: 'a', requirement: 'Sử dụng được các công cụ AI trong công việc và học tập hàng ngày.' },
        { id: '6.2TC1b', indicator: 'b', requirement: 'Thực hành được các kỹ năng sử dụng AI thông qua các bài tập và dự án nhỏ.' },
        { id: '6.2TC1c', indicator: 'c', requirement: 'Xem xét các khía cạnh đạo đức khi sử dụng AI, bảo đảm không vi phạm quyền riêng tư và bảo mật dữ liệu.' },
      ],
    },
    '6.3': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.3 Đánh giá trí tuệ nhân tạo',
      content: 'Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động.',
      items: [
        { id: '6.3TC1a', indicator: 'a', requirement: 'Giải thích được cách thức hoạt động của các hệ thống AI đơn giản.' },
        { id: '6.3TC1b', indicator: 'b', requirement: 'Tóm tắt được các đặc điểm và ứng dụng của hệ thống AI.' },
      ],
    },
  },
  'TC2': {
    '1.1': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số',
      content: 'Xác định được nhu cầu thông tin; tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số; truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm.',
      items: [
        { id: '1.1TC2a', indicator: 'a', requirement: 'Minh họa được nhu cầu thông tin.' },
        { id: '1.1TC2b', indicator: 'b', requirement: 'Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số.' },
        { id: '1.1TC2c', indicator: 'c', requirement: 'Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.' },
        { id: '1.1TC2d', indicator: 'd', requirement: 'Tổ chức được các chiến lược tìm kiếm.' },
      ],
    },
    '1.2': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.2. Đánh giá dữ liệu, thông tin và nội dung số',
      content: 'Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số.',
      items: [
        { id: '1.2TC2a', indicator: 'a', requirement: 'Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số.' },
        { id: '1.2TC2b', indicator: 'b', requirement: 'Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '1.3': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.3. Quản lý dữ liệu, thông tin và nội dung số',
      content: 'Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc.',
      items: [
        { id: '1.3TC2a', indicator: 'a', requirement: 'Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất.' },
        { id: '1.3TC2b', indicator: 'b', requirement: 'Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc.' },
      ],
    },
    '2.1': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.1. Tương tác thông qua công nghệ số',
      content: 'Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số nào phù hợp cho một bối cảnh nhất định.',
      items: [
        { id: '2.1TC2a', indicator: 'a', requirement: 'Lựa chọn được nhiều công nghệ số để tương tác.' },
        { id: '2.1TC2b', indicator: 'b', requirement: 'Lựa chọn được nhiều phương tiện truyền thông số cho phù hợp với bối cảnh nhất định.' },
      ],
    },
    '2.2': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số',
      content: 'Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết và thực hành trích dẫn và ghi chú nguồn.',
      items: [
        { id: '2.2TC2a', indicator: 'a', requirement: 'Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số.' },
        { id: '2.2TC2b', indicator: 'b', requirement: 'Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số.' },
        { id: '2.2TC2c', indicator: 'c', requirement: 'Áp dụng được các phương pháp tham chiếu và ghi chú nguồn.' },
      ],
    },
    '2.3': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân',
      content: 'Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội, để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp.',
      items: [
        { id: '2.3TC2a', indicator: 'a', requirement: 'Lựa chọn được các dịch vụ số để tham gia vào xã hội.' },
        { id: '2.3TC2b', indicator: 'b', requirement: 'Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công.' },
      ],
    },
    '2.4': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.4. Hợp tác thông qua công nghệ số',
      content: 'Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức.',
      items: [
        { id: '2.4TC2a', indicator: 'a', requirement: 'Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác.' },
      ],
    },
    '2.5': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.5. Quy tắc ứng xử trên mạng',
      content: 'Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số.  Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức đa dạng về văn hóa và thế hệ trong môi trường số.',
      items: [
        { id: '2.5TC2a', indicator: 'a', requirement: 'Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số.' },
        { id: '2.5TC2b', indicator: 'b', requirement: 'Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số.' },
        { id: '2.5TC2c', indicator: 'c', requirement: 'Thảo luận các khía cạnh đa dạng về văn hóa và thế hệ cần xem xét trong môi trường số.' },
      ],
    },
    '2.6': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.6. Quản lý danh tính số',
      content: 'Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số.',
      items: [
        { id: '2.6TC2a', indicator: 'a', requirement: 'Hiển thị được nhiều danh tính số cụ thể.' },
        { id: '2.6TC2b', indicator: 'b', requirement: 'Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân.' },
        { id: '2.6TC2c', indicator: 'c', requirement: 'Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số.' },
      ],
    },
    '3.1': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.1 Phát triển nội dung số',
      content: 'Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số.',
      items: [
        { id: '3.1TC2a', indicator: 'a', requirement: 'Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.' },
        { id: '3.1TC2b', indicator: 'b', requirement: 'Thể hiện được bản thân thông qua việc tạo ra các nội dung số.' },
      ],
    },
    '3.2': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.2. Tích hợp và tạo lập lại nội dung số',
      content: 'Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp.',
      items: [
        { id: '3.2TC2a', indicator: 'a', requirement: 'Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo.' },
      ],
    },
    '3.3': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.3. Thực thi bản quyền và giấy phép',
      content: 'Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số',
      items: [
        { id: '3.3TC2a', indicator: 'a', requirement: 'Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số.' },
      ],
    },
    '3.4': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.4. Lập trình',
      content: 'Lập được kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.',
      items: [
        { id: '3.4TC2a', indicator: 'a', requirement: 'Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.' },
      ],
    },
    '4.1': {
      domain: '4. An toàn',
      subName: '4.1. Bảo vệ thiết bị',
      content: 'Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và  bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư.',
      items: [
        { id: '4.1TC2a', indicator: 'a', requirement: 'Thiết lập được những cách thức bảo vệ thiết bị và nội dung số.' },
        { id: '4.1TC2b', indicator: 'b', requirement: 'Phân biệt được rủi ro và mối đe dọa trong môi trường số.' },
        { id: '4.1TC2c', indicator: 'c', requirement: 'Chọn lựa được các biện pháp an toàn và bảo mật.' },
        { id: '4.1TC2d', indicator: 'd', requirement: 'Giải thích được các cách thức để quan tâm đến mức độ tin cậy và quyền riêng tư.' },
      ],
    },
    '4.2': {
      domain: '4. An toàn',
      subName: '4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư',
      content: 'Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng “Chính sách Quyền riêng tư” để thông báo phương thức sử dụng dữ liệu cá nhân.',
      items: [
        { id: '4.2TC2a', indicator: 'a', requirement: 'Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.' },
        { id: '4.2TC2b', indicator: 'b', requirement: 'Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn.' },
        { id: '4.2TC2c', indicator: 'c', requirement: 'Chỉ ra được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số.' },
      ],
    },
    '4.3': {
      domain: '4. An toàn',
      subName: '4.3 Bảo vệ sức khỏe và an sinh số',
      content: 'Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.',
      items: [
        { id: '4.3TC2a', indicator: 'a', requirement: 'Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần.' },
        { id: '4.3TC2b', indicator: 'b', requirement: 'Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số.' },
        { id: '4.3TC2c', indicator: 'c', requirement: 'Thảo luận về những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.' },
      ],
    },
    '4.4': {
      domain: '4. An toàn',
      subName: '4.4 Bảo vệ môi trường',
      content: 'Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường.',
      items: [
        { id: '4.4TC2a', indicator: 'a', requirement: 'Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số.' },
      ],
    },
    '5.1': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.1. Giải quyết các vấn đề kỹ thuật',
      content: 'Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn).',
      items: [
        { id: '5.1TC2a', indicator: 'a', requirement: 'Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số.' },
        { id: '5.1TC2b', indicator: 'b', requirement: 'Chọn được giải pháp cho chúng.' },
      ],
    },
    '5.2': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.2 Xác định nhu cầu và giải pháp công nghệ',
      content: 'Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận).',
      items: [
        { id: '5.2TC2a', indicator: 'a', requirement: 'Giải thích nhu cầu cá nhân.' },
        { id: '5.2TC2b', indicator: 'b', requirement: 'Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.' },
        { id: '5.2TC2c', indicator: 'c', requirement: 'Chọn được cách điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.' },
      ],
    },
    '5.3': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.3 Sử dụng sáng tạo công nghệ số',
      content: 'Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số.',
      items: [
        { id: '5.3TC2a', indicator: 'a', requirement: 'Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm.' },
        { id: '5.3TC2b', indicator: 'b', requirement: 'Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số.' },
      ],
    },
    '5.4': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.4 Xác định các vấn đề cần cải thiện về NLS',
      content: 'Hiểu được NLS của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển NLS của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số.',
      items: [
        { id: '5.4TC2a', indicator: 'a', requirement: 'Thảo luận về lĩnh vực NLS của bản thân cần được cải thiện hoặc cập nhật.' },
        { id: '5.4TC2b', indicator: 'b', requirement: 'Chỉ ra được cách hỗ trợ người khác phát triển NLS của họ.' },
        { id: '5.4TC2c', indicator: 'c', requirement: 'Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển công nghệ số.' },
      ],
    },
    '6.1': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.1 Hiểu biết về trí tuệ nhân tạo',
      content: 'Hiểu được cách AI ảnh hưởng đến cuộc sống hàng ngày và vai trò của Al trong các lĩnh vực khác nhau. Nắm vững được nguyên tắc hoạt động của AI, khả năng và hạn chế của AI.',
      items: [
        { id: '6.1TC2a', indicator: 'a', requirement: 'Áp dụng được các nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản.' },
        { id: '6.1TC2b', indicator: 'b', requirement: 'Thực hiện được các thao tác cơ bản trên các công cụ AI.' },
      ],
    },
    '6.2': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.2 Sử dụng trí tuệ nhân tạo',
      content: 'Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hàng ngày.',
      items: [
        { id: '6.2TC2a', indicator: 'a', requirement: 'Tối ưu hóa việc sử dụng các công cụ AI để đạt hiệu quả cao hơn.' },
        { id: '6.2TC2b', indicator: 'b', requirement: 'Quản lý được việc triển khai các công cụ AI trong các dự án nhỏ.' },
        { id: '6.2TC2c', indicator: 'c', requirement: 'Bảo vệ được dữ liệu cá nhân và tuân thủ các quy định pháp luật về bảo mật thông tin khi sử dụng AI.' },
      ],
    },
    '6.3': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.3 Đánh giá trí tuệ nhân tạo',
      content: 'Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động.',
      items: [
        { id: '6.3TC2a', indicator: 'a', requirement: 'Phân tích được hiệu quả của hệ thống AI trong việc giải quyết các vấn đề cụ thể.' },
        { id: '6.3TC2b', indicator: 'b', requirement: 'So sánh được hiệu suất của các hệ thống AI khác nhau.' },
      ],
    },
  },
  'NC1': {
    '1.1': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.1. Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số',
      content: 'Xác định được nhu cầu thông tin; tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số; truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm.',
      items: [
        { id: '1.1NC1a', indicator: 'a', requirement: 'Đáp ứng được nhu cầu thông tin.' },
        { id: '1.1NC1b', indicator: 'b', requirement: 'Áp dụng được kỹ thuật tìm kiếm để lấy được dữ liệu, thông tin và nội dung trong môi trường số.' },
        { id: '1.1NC1c', indicator: 'c', requirement: 'Chỉ cho người khác cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.' },
        { id: '1.1NC1d', indicator: 'd', requirement: 'Tự đề xuất được chiến lược tìm kiếm.' },
      ],
    },
    '1.2': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.2. Đánh giá dữ liệu, thông tin và nội dung số',
      content: 'Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số.',
      items: [
        { id: '1.2NC1a', indicator: 'a', requirement: 'Thực hiện đánh giá được độ tin cậy và độ tin cậy của các nguồn dữ liệu, thông tin và nội dung số.' },
        { id: '1.2NC1b', indicator: 'b', requirement: 'Tiến hành đánh giá được các dữ liệu, thông tin và nội dung số khác nhau.' },
      ],
    },
    '1.3': {
      domain: '1. Khai thác dữ liệu và thông tin',
      subName: '1.3. Quản lý dữ liệu, thông tin và nội dung số',
      content: 'Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc.',
      items: [
        { id: '1.3NC1a', indicator: 'a', requirement: 'Thao tác được thông tin, dữ liệu và nội dung để tổ chức, lưu trữ và truy xuất dễ dàng hơn.' },
        { id: '1.3NC1b', indicator: 'b', requirement: 'Triển khai được việc tổ chức và sắp xếp dữ liệu, thông tin và nội dung trong môi trường có cấu trúc.' },
      ],
    },
    '2.1': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.1. Tương tác thông qua công nghệ số',
      content: 'Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số nào phù hợp cho một bối cảnh nhất định.',
      items: [
        { id: '2.1NC1a', indicator: 'a', requirement: 'Sử dụng được nhiều công nghệ số để tương tác.' },
        { id: '2.1NC1b', indicator: 'b', requirement: 'Cho người khác thấy phương tiện giao tiếp số phù hợp nhất cho một bối cảnh cụ thể.' },
      ],
    },
    '2.2': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.2. Chia sẻ thông tin và nội dung thông qua công nghệ số',
      content: 'Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết và thực hành trích dẫn và ghi chú nguồn.',
      items: [
        { id: '2.2NC1a', indicator: 'a', requirement: 'Chia sẻ dữ liệu, thông tin và nội dung số thông qua nhiều công cụ số phù hợp.' },
        { id: '2.2NC1b', indicator: 'b', requirement: 'Hướng dẫn người khác cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số.' },
        { id: '2.2NC1c', indicator: 'c', requirement: 'Áp dụng được nhiều phương pháp tham chiếu và ghi nguồn khác nhau.' },
      ],
    },
    '2.3': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.3. Sử dụng công nghệ số để thực hiện trách nhiệm công dân',
      content: 'Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội, để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp.',
      items: [
        { id: '2.3NC1a', indicator: 'a', requirement: 'Đề xuất được các dịch vụ số khác nhau để tham gia vào xã hội.' },
        { id: '2.3NC1b', indicator: 'b', requirement: 'Sử dụng được các công nghệ số thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân.' },
      ],
    },
    '2.4': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.4. Hợp tác thông qua công nghệ số',
      content: 'Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức.',
      items: [
        { id: '2.4NC1a', indicator: 'a', requirement: 'Đề xuất được các công cụ và công nghệ số khác nhau cho các quá trình hợp tác.' },
      ],
    },
    '2.5': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.5. Quy tắc ứng xử trên mạng',
      content: 'Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số.  Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức đa dạng về văn hóa và thế hệ trong môi trường số.',
      items: [
        { id: '2.5NC1a', indicator: 'a', requirement: 'Áp dụng được các chuẩn mực hành vi và bí quyết khác nhau khi sử dụng công nghệ số và tương tác trong môi trường số.' },
        { id: '2.5NC1b', indicator: 'b', requirement: 'Áp dụng được các chiến lược giao tiếp khác nhau trong môi trường số một cách phù hợp.' },
        { id: '2.5NC1c', indicator: 'c', requirement: 'Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau để xem xét trong môi trường số.' },
      ],
    },
    '2.6': {
      domain: '2. Giao tiếp và Hợp tác',
      subName: '2.6. Quản lý danh tính số',
      content: 'Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số.',
      items: [
        { id: '2.6NC1a', indicator: 'a', requirement: 'Sử dụng được nhiều danh tính số khác nhau.' },
        { id: '2.6NC1b', indicator: 'b', requirement: 'Áp dụng được các cách khác nhau để bảo vệ danh tính trực tuyến của bản thân.' },
        { id: '2.6NC1c', indicator: 'c', requirement: 'Sử dụng được dữ liệu tạo ra thông qua công cụ, môi trường và một số dịch vụ số.' },
      ],
    },
    '3.1': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.1 Phát triển nội dung số',
      content: 'Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số.',
      items: [
        { id: '3.1NC1a', indicator: 'a', requirement: 'Áp dụng được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.' },
        { id: '3.1NC1b', indicator: 'b', requirement: 'Chỉ ra được những cách thể hiện bản thân thông qua việc tạo ra các nội dung số.' },
      ],
    },
    '3.2': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.2. Tích hợp và tạo lập lại nội dung số',
      content: 'Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp.',
      items: [
        { id: '3.2NC1a', indicator: 'a', requirement: 'Làm việc với các mục nội dung và thông tin mới khác nhau, sửa đổi, tinh chỉnh, cải thiện và tích hợp chúng để tạo ra những mục mới và độc đáo.' },
      ],
    },
    '3.3': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.3. Thực thi bản quyền và giấy phép',
      content: 'Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số',
      items: [
        { id: '3.3NC1a', indicator: 'a', requirement: 'Áp dụng được các quy định khác nhau về bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số.' },
      ],
    },
    '3.4': {
      domain: '3. Sáng tạo nội dung số',
      subName: '3.4. Lập trình',
      content: 'Lập được kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.',
      items: [
        { id: '3.4NC1a', indicator: 'a', requirement: 'Tự thao tác được bằng các hướng dẫn dành cho hệ thống máy tính để giải quyết một vấn đề khác hoặc thực hiện các nhiệm vụ khác nhau.' },
      ],
    },
    '4.1': {
      domain: '4. An toàn',
      subName: '4.1. Bảo vệ thiết bị',
      content: 'Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và  bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư.',
      items: [
        { id: '4.1NC1a', indicator: 'a', requirement: 'Áp dụng được các cách khác nhau để bảo vệ thiết bị và nội dung số.' },
        { id: '4.1NC1b', indicator: 'b', requirement: 'Nhận thức được sự đa dạng của các rủi ro và đe dọa trong môi trường số.' },
        { id: '4.1NC1c', indicator: 'c', requirement: 'Áp dụng được các biện pháp an toàn và bảo mật.' },
        { id: '4.1NC1d', indicator: 'd', requirement: 'Sử dụng được các cách thức khác nhau để quan tâm đến mức độ tin cậy và quyền riêng tư.' },
      ],
    },
    '4.2': {
      domain: '4. An toàn',
      subName: '4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư',
      content: 'Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng “Chính sách Quyền riêng tư” để thông báo phương thức sử dụng dữ liệu cá nhân.',
      items: [
        { id: '4.2NC1a', indicator: 'a', requirement: 'Áp dụng được các cách thức khác nhau để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.' },
        { id: '4.2NC1b', indicator: 'b', requirement: 'Áp dụng được các cách thức đặc thù để chia sẻ dữ liệu cá nhân một cách an toàn.' },
        { id: '4.2NC1c', indicator: 'c', requirement: 'Giải thích được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số.' },
      ],
    },
    '4.3': {
      domain: '4. An toàn',
      subName: '4.3 Bảo vệ sức khỏe và an sinh số',
      content: 'Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.',
      items: [
        { id: '4.3NC1a', indicator: 'a', requirement: 'Trình bày được các cách thức khác nhau để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.' },
        { id: '4.3NC1b', indicator: 'b', requirement: 'Áp dụng được các cách thức khác nhau để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số.' },
        { id: '4.3NC1c', indicator: 'c', requirement: 'Trình bày được các công nghệ số khác nhau giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.' },
      ],
    },
    '4.4': {
      domain: '4. An toàn',
      subName: '4.4 Bảo vệ môi trường',
      content: 'Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường.',
      items: [
        { id: '4.4NC1a', indicator: 'a', requirement: 'Trình bày được các cách thức khác nhau để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số.' },
      ],
    },
    '5.1': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.1. Giải quyết các vấn đề kỹ thuật',
      content: 'Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn).',
      items: [
        { id: '5.1NC1a', indicator: 'a', requirement: 'Đánh giá được các vấn đề kỹ thuật khi sử dụng môi trường số và vận hành các thiết bị số.' },
        { id: '5.1NC1b', indicator: 'b', requirement: 'Áp dụng được các giải pháp khác nhau cho chúng.' },
      ],
    },
    '5.2': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.2 Xác định nhu cầu và giải pháp công nghệ',
      content: 'Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận).',
      items: [
        { id: '5.2NC1a', indicator: 'a', requirement: 'Đánh giá được nhu cầu cá nhân.' },
        { id: '5.2NC1b', indicator: 'b', requirement: 'Áp dụng được các công cụ số khác nhau và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.' },
        { id: '5.2NC1c', indicator: 'c', requirement: 'Sử dụng được các cách khác nhau để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.' },
      ],
    },
    '5.3': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.3 Sử dụng sáng tạo công nghệ số',
      content: 'Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số.',
      items: [
        { id: '5.3NC1a', indicator: 'a', requirement: 'Áp dụng được các công cụ và công nghệ số khác nhau để tạo ra kiến thức cũng như các quy trình và sản phẩm đổi mới.' },
        { id: '5.3NC1b', indicator: 'b', requirement: 'Áp dụng xử lý nhận thức của cá nhân và tập thể để giải quyết các vấn đề khái niệm và tình huống có vấn đề khác nhau trong môi trường số.' },
      ],
    },
    '5.4': {
      domain: '5. Giải quyết vấn đề',
      subName: '5.4 Xác định các vấn đề cần cải thiện về NLS',
      content: 'Hiểu được NLS của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển NLS của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số.',
      items: [
        { id: '5.4NC1a', indicator: 'a', requirement: 'Chứng minh được NLS của tôi cần được cải thiện hoặc cập nhật ở đâu.' },
        { id: '5.4NC1b', indicator: 'b', requirement: 'Minh họa được những cách khác nhau để hỗ trợ người khác phát triển NLS của họ.' },
        { id: '5.4NC1c', indicator: 'c', requirement: 'Đề xuất được các cơ hội khác nhau để phát triển bản thân và cập nhật sự phát triển công nghệ số.' },
      ],
    },
    '6.1': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.1 Hiểu biết về trí tuệ nhân tạo',
      content: 'Hiểu được cách AI ảnh hưởng đến cuộc sống hàng ngày và vai trò của Al trong các lĩnh vực khác nhau. Nắm vững được nguyên tắc hoạt động của AI, khả năng và hạn chế của AI.',
      items: [
        { id: '6.1NC1a', indicator: 'a', requirement: 'Phân tích được cách AI hoạt động trong các ứng dụng cụ thể.' },
        { id: '6.1NC1b', indicator: 'b', requirement: 'So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu.' },
      ],
    },
    '6.2': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.2 Sử dụng trí tuệ nhân tạo',
      content: 'Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hàng ngày.',
      items: [
        { id: '6.2NC1a', indicator: 'a', requirement: 'Phát triển được các ứng dụng AI tùy chỉnh để giải quyết các vấn đề cụ thể.' },
        { id: '6.2NC1b', indicator: 'b', requirement: 'Điều chỉnh được các hệ thống AI để phù hợp với nhu cầu cụ thể.' },
        { id: '6.2NC1c', indicator: 'c', requirement: 'Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI.' },
      ],
    },
    '6.3': {
      domain: '6. Ứng dụng trí tuệ nhân tạo',
      subName: '6.3 Đánh giá trí tuệ nhân tạo',
      content: 'Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động.',
      items: [
        { id: '6.3NC1a', indicator: 'a', requirement: 'Đánh giá được độ chính xác và tin cậy của các hệ thống AI.' },
        { id: '6.3NC1b', indicator: 'b', requirement: 'Xem xét được các kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI.' },
      ],
    },
  },
};

/**
 * Lấy danh sách NL số phù hợp cấp học/lớp
 */
export function getDigitalLiteracyForClass(schoolLevel: string, classLevel: string): { level: NLSLevel; data: Record<string, NLSSubCompetency> }[] {
  const levels = getNLSLevelsForSchool(schoolLevel, classLevel);
  return levels.map(lvl => ({ level: lvl, data: NLS_DATABASE[lvl] || {} }));
}

/**
 * Xây dựng prompt NLS cho AI
 */
export function buildDigitalLiteracyPrompt(schoolLevel: string, classLevel: string): string {
  if (!schoolLevel) return '';
  const levelData = getDigitalLiteracyForClass(schoolLevel, classLevel);
  if (levelData.length === 0) return '';

  const parts: string[] = [];
  parts.push('## NĂNG LỰC SỐ (NLS) - Mã hóa theo QĐ 3439/QĐ-BGDĐT');

  for (const { level, data } of levelData) {
    const levelName = { CB1: 'Cơ bản 1 (Lớp 1-3)', CB2: 'Cơ bản 2 (Lớp 4-5)', TC1: 'Trung cấp 1 (Lớp 6-7)', TC2: 'Trung cấp 2 (Lớp 8-9)', NC1: 'Nâng cao (Lớp 10-12)' }[level] || level;
    parts.push(`\nMức: **${level}** - ${levelName}`);

    // Group by domain
    const domains = new Map<string, { key: string; sub: NLSSubCompetency }[]>();
    for (const [key, sub] of Object.entries(data)) {
      const domainKey = sub.domain;
      if (!domains.has(domainKey)) domains.set(domainKey, []);
      domains.get(domainKey)!.push({ key, sub });
    }

    for (const [domain, subs] of domains) {
      parts.push(`\n### ${domain}`);
      for (const { key, sub } of subs) {
        parts.push(`- **${sub.subName}**: ${sub.content.substring(0, 150)}...`);
        // Chỉ liệt kê YCCD chính (indicator a)
        const mainReq = sub.items.find(i => i.indicator === 'a');
        if (mainReq) parts.push(`  YCCD chính [${mainReq.id}]: ${mainReq.requirement}`);
      }
    }
  }

  parts.push('\n### HƯỚNG DẪN TÍCH HỢP NLS');
  parts.push('- Chọn 1-3 NL số phù hợp nhất với bài học');
  parts.push('- Ghi rõ MÃ YCCD (ví dụ: 1.1CB1a) trong phần mục tiêu');
  parts.push('- NLS phải được tích hợp TỰ NHIÊN vào hoạt động dạy học');

  return parts.join('\n');
}