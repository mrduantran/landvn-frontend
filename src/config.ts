// Tập trung cấu hình các URL của backend tại đây.
// Giá trị được lấy từ biến môi trường (.env / .env.production)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const WS_URL = import.meta.env.VITE_WS_URL as string;
