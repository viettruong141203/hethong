/**
 * =========================================================
 * MODULE: ThanhToanAPI
 * MÔ TẢ: Giao tiếp với Google Sheets Web App API
 * CHỨC NĂNG: Thêm dữ liệu (add) và Đọc dữ liệu (get) siêu tốc
 * =========================================================
 */

// Đã cập nhật URL Web App thực tế của bạn
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
   * 🚀 Gửi dữ liệu (Thêm dòng mới vào Google Sheets)
   * @param {Object|Array} data - Dữ liệu cần thêm. Ví dụ: { "A": "Giá trị 1", "B": "Giá trị 2" }
   * @returns {Promise<Object>} Phản hồi từ server { status, added_rows, results }
   */
  static async addData(data) {
    if (!data) throw new Error("Dữ liệu không được để trống!");

    const payload = {
      action: "add",
      sheet: "Thanh toán",
      data: data
    };

    try {
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      const result = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.message);
      }
      return result;
    } catch (error) {
      console.error("❌ Lỗi khi gửi dữ liệu lên Google Sheets:", error);
      throw error;
    }
  }

  /**
   * ⚡ Lấy dữ liệu từ Sheet (Có sử dụng Cache 6 tiếng từ server)
   * @returns {Promise<Object>} Phản hồi từ server { status, total_rows, results }
   */
  static async getData() {
    const payload = {
      action: "get",
      sheet: "Thanh toán"
    };

    try {
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      const result = await response.json();
      
      if (result.status === "error") {
        throw new Error(result.message);
      }
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
