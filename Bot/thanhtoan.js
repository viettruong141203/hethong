/**
 * =========================================================
 * MODULE: ThanhToanAPI
 * MÔ TẢ: Giao tiếp với Google Sheets Web App API (Hỗ trợ nhiều Sheet)
 * CHỨC NĂNG: Thêm dữ liệu (add) và Đọc dữ liệu (get) siêu tốc
 * =========================================================
 */

// ⚠️ QUAN TRỌNG: Hãy đảm bảo đây là URL Web App Google Apps Script mới nhất của bạn
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby6NI-jU7bgR-W18zG2iVCqmAeGVqoZmmZqlsWFXf5lzJSMT3q5J2mP45Or_buOzjyb0Q/exec";

class ThanhToanAPI {
  /**
   * Cấu hình mặc định cho các request fetch
   * @param {Object} payload - Dữ liệu JSON cần gửi
   * @returns {Object} Cấu hình fetch
   */
  static _getFetchOptions(payload) {
    return {
      method: "POST",
      // Dùng text/plain để trình duyệt không gửi request OPTIONS (CORS preflight) gây lỗi
      headers: {
        "Content-Type": "text/plain;charset=utf-8", 
      },
      body: JSON.stringify(payload)
    };
  }

  /**
   * 🚀 GỬI DỮ LIỆU (Thêm dòng mới vào Google Sheets)
   * 
   * @param {String} sheetName - Tên của trang tính (VD: "Trang tính 1", "Khách hàng")
   * @param {Object} data - Dữ liệu cần thêm. Ví dụ: { "A": "Giá trị 1", "B": "Giá trị 2" }
   * @returns {Promise<Object>} Phản hồi từ server { status, added_rows, results: { row, data } }
   */
  static async addData(sheetName, data) {
    // 1. Kiểm tra đầu vào
    if (!sheetName || typeof sheetName !== 'string') {
        throw new Error("Tên Sheet không hợp lệ hoặc bị bỏ trống!");
    }
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Dữ liệu gửi lên không được để trống!");
    }

    // 2. Chuẩn bị payload
    const payload = {
      action: "add",
      sheet: sheetName.trim(), // Xóa khoảng trắng thừa
      data: data
    };

    try {
      // 3. Gửi Request
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      
      // 4. Phân tích kết quả trả về (Response Data)
      const result = await response.json();
      
      // Xử lý nếu Apps Script trả về lỗi logic (VD: Không tìm thấy sheet)
      if (result.status === "error") {
        throw new Error(result.message || "Lỗi không xác định từ Google Sheets");
      }
      
      // 5. Trả về toàn bộ Object kết quả cho giao diện (UI) sử dụng
      return result; 

    } catch (error) {
      console.error("❌ Lỗi khi gửi dữ liệu lên Google Sheets:", error);
      throw error;
    }
  }

  /**
   * ⚡ LẤY DỮ LIỆU (Đọc toàn bộ dữ liệu từ Sheet chỉ định - Có Cache)
   * 
   * @param {String} sheetName - Tên của trang tính (VD: "Trang tính 1")
   * @returns {Promise<Object>} Phản hồi từ server { status, total_rows, results: [ {row, data}, ... ] }
   */
  static async getData(sheetName) {
    // 1. Kiểm tra đầu vào
    if (!sheetName || typeof sheetName !== 'string') {
        throw new Error("Tên Sheet không hợp lệ hoặc bị bỏ trống!");
    }

    // 2. Chuẩn bị payload
    const payload = {
      action: "get",
      sheet: sheetName.trim()
    };

    try {
      // 3. Gửi Request
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      
      // 4. Phân tích kết quả trả về
      const result = await response.json();
      
      // Xử lý lỗi từ phía server
      if (result.status === "error") {
        throw new Error(result.message || "Không thể tải dữ liệu. Hãy kiểm tra lại Tên Sheet.");
      }
      
      // 5. Trả về danh sách dữ liệu
      return result; 

    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu từ Google Sheets:", error);
      throw error;
    }
  }
}

// =========================================================
// XUẤT MODULE (Tương thích đa môi trường)
// =========================================================

// 1. Môi trường Node.js hoặc các Bundler (Webpack, Vite) dùng trong React/Vue
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThanhToanAPI;
} 
// 2. Môi trường ES6 Module tĩnh
else if (typeof exports !== 'undefined') {
  exports.ThanhToanAPI = ThanhToanAPI;
} 
// 3. Môi trường Trình duyệt (HTML thuần dùng thẻ <script>)
else if (typeof window !== 'undefined') {
  window.ThanhToanAPI = ThanhToanAPI;
}
