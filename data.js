// data.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

let isSyncing = false;
let syncTimeout = null;

const DataManager = {
  // 1. LẤY DỮ LIỆU ĐÃ LƯU VĨNH VIỄN TRÊN MÁY (Tốc độ 0 giây)
  getOffline(sheetName) {
    const cached = localStorage.getItem("app_data_" + sheetName);
    return cached ? JSON.parse(cached) : null;
  },

  // 2. GỌI API LẤY TẤT CẢ CÁC BẢNG CÙNG LÚC VÀ LƯU LẠI
  async syncMultipleSheets() {
    try {
      // Gửi lệnh json yêu cầu lấy 3 sheet
      const payload = {
        "action": "get_multiple",
        "sheets": ["Home", "Face ID", "Ngân hàng"]
      };

      const response = await fetch(SCRIPT_URL, {
        method: "POST", 
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload), 
        redirect: "follow"
      });
      const result = await response.json();
      
      if (result.status === "success") {
        // Tách dữ liệu của từng sheet và lưu vĩnh viễn vào localStorage
        // Hỗ trợ cả trường hợp API trả về trong result.data hoặc trả trực tiếp ngoài result
        const sheetsData = result.data || result; 
        
        ["Home", "Face ID", "Ngân hàng"].forEach(sheet => {
          if (sheetsData[sheet]) {
            localStorage.setItem("app_data_" + sheet, JSON.stringify(sheetsData[sheet]));
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu tổng:", error);
      return false;
    }
  },

  // 3. VÒNG LẶP CHẠY NGẦM CẬP NHẬT TẤT CẢ 2 GIÂY/LẦN
  // Hàm này giờ không cần truyền sheetName nữa vì nó sẽ đồng bộ tất cả
  startAutoSync(intervalMs, callbackHome) {
    isSyncing = true;
    
    // BƯỚC 1: Hiển thị ngay lập tức danh sách Home đang có sẵn trong máy
    const offlineHome = this.getOffline("Home");
    if (offlineHome && callbackHome) {
      callbackHome(offlineHome);
    }

    // BƯỚC 2: Chạy API ngầm sau lưng để xem có dữ liệu mới ở bất kỳ sheet nào không
    const loop = async () => {
      if (!isSyncing) return;
      
      // Kích hoạt gọi API gộp 3 sheet
      const success = await this.syncMultipleSheets(); 
      
      // Nếu có dữ liệu mới thành công, đẩy ra giao diện cập nhật
      if (success && isSyncing && callbackHome) {
        const liveHome = this.getOffline("Home");
        if (liveHome) callbackHome(liveHome); 
      }

      // Đợi đúng 2s sau đó lặp lại
      if (isSyncing) syncTimeout = setTimeout(loop, intervalMs);
    };
    
    loop(); // Bắt đầu vòng lặp
  },

  // 4. Lệnh thêm mới dữ liệu (giữ nguyên)
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

  // 5. Dừng vòng lặp và xóa bộ nhớ
  stopAutoSync() {
    isSyncing = false;
    if (syncTimeout) clearTimeout(syncTimeout);
  },
  
  clearCache() {
    localStorage.clear();
  }
};
