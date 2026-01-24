export interface Slide {
  id: number;
  title: string;
  content: string;
}

export const defaultSlides: Slide[] = [
  {
    id: 1,
    title: 'Trang Tiêu Đề',
    content: `
      <h1 style="color: #2563eb; font-size: 3.5rem; margin-bottom: 20px;">Hướng Dẫn Toán Học</h1>
      <p style="font-size: 1.8rem; color: #1e293b; margin-bottom: 15px;">Ứng Dụng Các Hàm Số</p>
      <div style="background: #eff6ff; border-left: 5px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
        <p style="font-size: 1.3rem; color: #1e40af;">Giáo viên: Nguyễn Văn A</p>
        <p style="font-size: 1.3rem; color: #1e40af;">Lớp: 10A1</p>
      </div>
    `,
  },
  {
    id: 2,
    title: 'Nội Dung Chính',
    content: `
      <h2 style="color: #1e40af; font-size: 2.5rem; border-bottom: 3px solid #f59e0b; display: inline-block; padding-bottom: 10px; margin-bottom: 30px;">Nội Dung Bài Học</h2>
      <ul style="font-size: 1.5rem; line-height: 1.8; padding-left: 40px; color: #1e293b;">
        <li style="margin-bottom: 15px;">I. Định Nghĩa Hàm Số</li>
        <li style="margin-bottom: 15px;">II. Các Tính Chất Cơ Bản</li>
        <li style="margin-bottom: 15px;">III. Ứng Dụng Thực Tế</li>
        <li style="margin-bottom: 15px;">IV. Bài Tập Thực Hành</li>
      </ul>
    `,
  },
  {
    id: 3,
    title: 'Định Nghĩa',
    content: `
      <h2 style="color: #1e40af; font-size: 2.5rem; border-bottom: 3px solid #f59e0b; display: inline-block; padding-bottom: 10px; margin-bottom: 30px;">I. Định Nghĩa Hàm Số</h2>
      <div style="background: #eff6ff; border-left: 5px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="font-size: 1.4rem; color: #1e293b; line-height: 1.6;">
          Cho hai tập hợp X và Y khác rỗng. Một hàm số từ X đến Y là một quy tắc đặt tương ứng mỗi phần tử x ∈ X với duy nhất một phần tử y ∈ Y.
        </p>
      </div>
      <p style="font-size: 1.3rem; color: #1e293b; margin-top: 20px;">Ký hiệu: <strong>f: X → Y</strong></p>
      <p style="font-size: 1.3rem; color: #1e293b;">Công thức: <strong>y = f(x)</strong></p>
    `,
  },
  {
    id: 4,
    title: 'Công Thức Toán',
    content: `
      <h2 style="color: #1e40af; font-size: 2.5rem; border-bottom: 3px solid #f59e0b; display: inline-block; padding-bottom: 10px; margin-bottom: 30px;">II. Công Thức Toán Học</h2>
      <div style="background: #eff6ff; border-left: 5px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="font-size: 1.3rem; color: #1e293b; margin-bottom: 15px;">Hàm số bậc hai:</p>
        <p style="font-size: 1.5rem; font-weight: bold; color: #1e40af;">$$f(x) = ax^2 + bx + c, (a \\neq 0)$$</p>
      </div>
      <div style="background: #fffbeb; border-left: 5px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="font-size: 1.3rem; color: #1e293b; margin-bottom: 10px;">Đỉnh của Parabol:</p>
        <p style="font-size: 1.4rem; color: #1e293b;">$$I\\left(-\\frac{b}{2a}, -\\frac{\\Delta}{4a}\\right)$$</p>
      </div>
    `,
  },
  {
    id: 5,
    title: 'Bài Tập',
    content: `
      <h2 style="color: #1e40af; font-size: 2.5rem; border-bottom: 3px solid #f59e0b; display: inline-block; padding-bottom: 10px; margin-bottom: 30px;">III. Bài Tập Thực Hành</h2>
      <ul style="font-size: 1.4rem; line-height: 1.8; padding-left: 40px; color: #1e293b;">
        <li style="margin-bottom: 15px;">Bài 1: Tìm tập xác định của hàm số $f(x) = \\frac{1}{x-2}$</li>
        <li style="margin-bottom: 15px;">Bài 2: Xác định tính chẵn lẻ của hàm số $f(x) = x^3 + x$</li>
        <li style="margin-bottom: 15px;">Bài 3: Vẽ đồ thị hàm số $y = x^2 - 4x + 3$</li>
      </ul>
    `,
  },
];
