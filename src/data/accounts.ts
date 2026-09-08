/**
 * Danh sách tài khoản được phép sử dụng tính năng NCBH & STEM
 * Format: { username, password, name }
 */

export interface AccountInfo {
  username: string;
  password: string;
  name: string;
}

export const PREMIUM_ACCOUNTS: AccountInfo[] = [
  { username: "duonghangdtntls@gmail.com", password: "SKKN100", name: "GV" },
  { username: "doanthiyen2003st@gmail.com", password: "123456", name: "GV" },
  { username: "hasonha75@gmail.com", password: "SKKN100", name: "GV" },
  { username: "nguyenthuybichthu1979@gmail.com", password: "SKKN100", name: "GV" },
  { username: "VIPKIMCUONG", password: "123456", name: "GV" },
];

/**
 * Kiểm tra đăng nhập
 */
export function validateLogin(username: string, password: string): AccountInfo | null {
  const account = PREMIUM_ACCOUNTS.find(
    acc => acc.username.toLowerCase() === username.toLowerCase().trim() && acc.password === password.trim()
  );
  return account || null;
}
