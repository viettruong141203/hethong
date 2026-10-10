const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

let isSyncing = false;
let syncTimeout = null;

const DataManager = {
  // Lấy dữ liệu 0 giây từ máy tính
  getOffline(sheetName) {
    const cached = localStorage.getItem("app_data_" + sheetName);
    return cached ? JSON.parse(cached) : null;
  },

  // Gọi trực tiếp (Dành riêng cho xác thực lúc Đăng nhập)
  async get(sheetName) {
    try {
      const payload = { "sheet": sheetName, "action": "get" };
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return (data.status === "success" && data.all_data) ? data.all_data : null;
    } catch (error) { return null; }
  },

  // Lệnh thêm dữ liệu mới
  async add(sheetName, dataObj) {
    try {
      const payload = { "sheet": sheetName, "action": "add", ...dataObj };
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      return { success: (result.status === "success" || result.message === "Thành công") };
    } catch (error) {
      return { success: false, message: "Lỗi kết nối mạng" };
    }
  },

  // CHẠY SONG SONG 3 BẢNG CÙNG LÚC
  async syncMultipleSheets() {
    try {
      const sheetsToFetch = ["Home", "Face ID", "Ngân hàng"];
      const sheetsData = {};

      // Tạo 3 luồng gọi API độc lập chạy cùng lúc
      const promises = sheetsToFetch.map(async (sheet) => {
        const payload = { "sheet": sheet, "action": "get" };
        const response = await fetch(SCRIPT_URL, {
          method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        // Nếu lấy thành công, lập tức lưu vĩnh viễn vào máy
        if (result.status === "success" && result.all_data) {
          sheetsData[sheet] = result.all_data;
          localStorage.setItem("app_data_" + sheet, JSON.stringify(result.all_data));
        }
      });

      // Chờ cả 3 luồng chạy xong
      await Promise.all(promises);
      return sheetsData;
      
    } catch (error) { 
      console.error("Lỗi đồng bộ ngầm:", error); 
      return null;
    }
  },

  // CỖ MÁY CHẠY NGẦM LIÊN TỤC 3 GIÂY/LẦN
  startBackgroundWorker(callbackHome) {
    isSyncing = true;

    // Hiển thị ngay lập tức dữ liệu cũ
    const offlineHome = this.getOffline("Home");
    if (offlineHome && callbackHome) callbackHome(offlineHome);

    const loop = async () => {
      if (!isSyncing) return;
      
      // Gọi API lấy dữ liệu mới
      const sheetsData = await this.syncMultipleSheets();
      
      // Báo cho trang chủ cập nhật nếu có dữ liệu Home mới
      if (sheetsData && sheetsData["Home"] && callbackHome) {
        callbackHome(sheetsData["Home"]);
      }

      // Đợi đúng 3 giây (3000ms) rồi gọi lại vòng lặp
      if (isSyncing) syncTimeout = setTimeout(loop, 3000);
    };
    
    loop(); // Bắt đầu khởi động
  },

  // Hủy chạy ngầm và xóa bộ nhớ
  stopBackgroundWorker() {
    isSyncing = false;
    if (syncTimeout) clearTimeout(syncTimeout);
  },
  
  clearCache() {
    localStorage.clear();
  }
};
