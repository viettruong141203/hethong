const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

let isSyncing = false;
let syncTimeout = null;

const DataManager = {
  // Lấy dữ liệu 0 giây từ máy tính
  getOffline(sheetName) {
    const cached = localStorage.getItem("app_data_" + sheetName);
    return cached ? JSON.parse(cached) : null;
  },

  // Gọi trực tiếp (Chỉ dùng khi Đăng nhập)
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

  // Gửi lệnh get_multiple lấy 3 bảng cùng lúc
  async syncMultipleSheets() {
    try {
      const payload = { 
        "action": "get_multiple", 
        "sheets": ["Home", "Face ID", "Ngân hàng"] 
      };
      
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.status === "success") {
        const sheetsData = result.data || result;
        // Lưu vĩnh viễn dữ liệu của từng bảng vào máy
        ["Home", "Face ID", "Ngân hàng"].forEach(sheet => {
          if (sheetsData[sheet]) {
            localStorage.setItem("app_data_" + sheet, JSON.stringify(sheetsData[sheet]));
          }
        });
        return sheetsData; 
      }
    } catch (error) { console.error("Lỗi đồng bộ ngầm:", error); }
    return null;
  },

  // Kích hoạt cỗ máy chạy ngầm 2s/lần
  startBackgroundWorker(callbackHome) {
    isSyncing = true;

    // Hiển thị ngay lập tức dữ liệu cũ
    const offlineHome = this.getOffline("Home");
    if (offlineHome && callbackHome) callbackHome(offlineHome);

    const loop = async () => {
      if (!isSyncing) return;
      
      // Gọi API lấy dữ liệu mới
      const sheetsData = await this.syncMultipleSheets();
      
      // Nếu có dữ liệu mới của Home, báo cho giao diện cập nhật
      if (sheetsData && sheetsData["Home"] && callbackHome) {
        callbackHome(sheetsData["Home"]);
      }

      // Đợi đúng 2s mới chạy tiếp vòng lặp
      if (isSyncing) syncTimeout = setTimeout(loop, 2000);
    };
    
    loop();
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
