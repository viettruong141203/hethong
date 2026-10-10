// data.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

let isSyncing = false;
let syncTimeout = null;

const DataManager = {
  // 1. Lấy dữ liệu "LƯU TRỮ MÃI MÃI" trên máy (Tốc độ 0 giây)
  getOffline(sheetName) {
    const cached = localStorage.getItem("app_data_" + sheetName);
    return cached ? JSON.parse(cached) : null;
  },

  // 2. Gọi API để lấy dữ liệu từ Google Sheets
  async get(sheetName) {
    try {
      const payload = { "sheet": sheetName, "action": "get" };
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload), redirect: "follow"
      });
      const data = await response.json();
      
      if (data.status === "success" && data.all_data) {
        // LƯU MÃI MÃI vào máy mỗi khi gọi API thành công
        localStorage.setItem("app_data_" + sheetName, JSON.stringify(data.all_data));
        return data.all_data;
      }
      return null;
    } catch (error) {
      console.error("Lỗi API:", error);
      return null;
    }
  },

  // 3. Thêm dữ liệu lên Sheets
  async add(sheetName, dataObj) {
    try {
      const payload = { "sheet": sheetName, "action": "add", ...dataObj };
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload), redirect: "follow"
      });
      const result = await response.json();
      return { success: (result.status === "success" || result.message === "Thành công") };
    } catch (error) {
      return { success: false, message: "Lỗi kết nối mạng" };
    }
  },

  // 4. VÒNG LẶP CHẠY NGẦM & KẾT HỢP BỘ NHỚ LƯU MÃI
  startAutoSync(sheetName, intervalMs, callback) {
    isSyncing = true;
    
    // BƯỚC 1: Hiện ngay lập tức dữ liệu đã "Lưu mãi mãi" ra màn hình (Không cần chờ mạng)
    const offlineData = this.getOffline(sheetName);
    if (offlineData) {
      callback(offlineData);
    }

    // BƯỚC 2: Chạy API ngầm sau lưng 2s/lần để xem có ai thêm web mới không
    const loop = async () => {
      if (!isSyncing) return;
      
      const liveData = await this.get(sheetName); 
      if (liveData && isSyncing) {
        // Nếu trên Google Sheets có dữ liệu mới, tự động đẩy ra giao diện
        callback(liveData); 
      }

      // Đợi 2 giây sau mới gọi tiếp vòng lặp
      if (isSyncing) syncTimeout = setTimeout(loop, intervalMs);
    };
    
    loop(); // Bắt đầu khởi động vòng lặp
  },

  // Dừng vòng lặp (khi đăng xuất)
  stopAutoSync() {
    isSyncing = false;
    if (syncTimeout) clearTimeout(syncTimeout);
  },
  
  // Xóa bộ nhớ mãi mãi khi đăng xuất
  clearCache() {
    localStorage.clear();
  }
};
