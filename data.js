const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

const DataManager = {
  // Lấy dữ liệu vĩnh viễn (0 giây)
  getOffline(sheetName) {
    const cached = localStorage.getItem("app_data_" + sheetName);
    return cached ? JSON.parse(cached) : null;
  },

  // Gọi trực tiếp (Dành riêng cho kiểm tra Đăng nhập - DSTK)
  async get(sheetName) {
    try {
      const payload = { "sheet": sheetName, "action": "get" };
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload), redirect: "follow"
      });
      const data = await response.json();
      return (data.status === "success" && data.all_data) ? data.all_data : null;
    } catch (error) { return null; }
  },

  // Lệnh thêm dữ liệu
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

  // Kích hoạt Web Worker chạy ngầm
  startBackgroundWorker(callbackHome) {
    const worker = new Worker('worker.js');
    this.activeWorker = worker;

    // Hiện ngay dữ liệu cũ
    const offlineHome = this.getOffline("Home");
    if (offlineHome && callbackHome) callbackHome(offlineHome);

    // Lắng nghe dữ liệu mới từ Worker
    worker.onmessage = (event) => {
      if (event.data.type === 'SYNC_SUCCESS') {
        const sheetsData = event.data.data;
        
        // Lưu vĩnh viễn vào bộ nhớ
        ["Home", "Face ID", "Ngân hàng"].forEach(sheet => {
          if (sheetsData[sheet]) {
            localStorage.setItem("app_data_" + sheet, JSON.stringify(sheetsData[sheet]));
          }
        });

        // Báo cho giao diện cập nhật danh sách trang Web
        if (sheetsData["Home"] && callbackHome) {
          callbackHome(sheetsData["Home"]);
        }
      }
    };

    worker.postMessage('START');
  },

  // Hủy Worker khi Đăng xuất
  stopBackgroundWorker() {
    if (this.activeWorker) {
      this.activeWorker.terminate();
      this.activeWorker = null;
    }
  },
  
  clearCache() {
    localStorage.clear();
  }
};
