// data.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

let isSyncing = false;
let syncTimeout = null;

const DataManager = {
  // Lấy dữ liệu 1 lần
  async get(sheetName) {
    try {
      const payload = { "sheet": sheetName, "action": "get" };
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });
      const data = await response.json();
      
      if (data.status === "success" && data.all_data) {
        return data.all_data;
      }
      return null;
    } catch (error) {
      console.error("Lỗi lấy dữ liệu API:", error);
      return null;
    }
  },

  // Thêm dữ liệu mới
  async add(sheetName, dataObj) {
    try {
      const payload = { "sheet": sheetName, "action": "add", ...dataObj };
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });
      const result = await response.json();
      
      if (result.status === "success" || result.message === "Thành công") {
        return { success: true };
      }
      return { success: false, message: result.message || "Không xác định" };
    } catch (error) {
      return { success: false, message: "Lỗi kết nối mạng" };
    }
  },

  // KHỞI ĐỘNG VÒNG LẶP CHẠY NGẦM LIÊN TỤC
  startAutoSync(sheetName, intervalMs, callback) {
    isSyncing = true;
    console.log(`[AutoSync] Bắt đầu gọi API mỗi ${intervalMs/1000} giây...`);

    const loop = async () => {
      if (!isSyncing) return; // Dừng lại nếu người dùng đã đăng xuất
      
      const data = await this.get(sheetName);
      
      // Gửi dữ liệu về giao diện mà không làm mới trang
      if (data && isSyncing) {
        callback(data);
      }

      // Đợi đúng khoảng thời gian (2s) sau khi tải XONG mới gọi tiếp
      // Chống quá tải và treo trình duyệt nếu mạng chậm
      if (isSyncing) {
        syncTimeout = setTimeout(loop, intervalMs);
      }
    };
    
    loop(); // Kích hoạt chạy lần đầu tiên
  },

  // DỪNG CHẠY NGẦM KHI ĐĂNG XUẤT
  stopAutoSync() {
    isSyncing = false;
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    console.log("[AutoSync] Đã dừng chạy ngầm.");
  }
};
