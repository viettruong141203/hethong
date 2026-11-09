/**
 * =========================================================
 * MODULE: ThanhToanAPI
 * MÔ TẢ: Giao tiếp với Google Sheets Web App API (Hỗ trợ nhiều Sheet)
 * CHỨC NĂNG: Thêm dữ liệu (add) và Đọc dữ liệu (get) siêu tốc
 * =========================================================
 */

// URL Web App Google Apps Script của bạn
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby6NI-jU7bgR-W18zG2iVCqmAeGVqoZmmZqlsWFXf5lzJSMT3q5J2mP45Or_buOzjyb0Q/exec";

class ThanhToanAPI {
  /**
   * Cấu hình mặc định cho các request fetch
   */
  static _getFetchOptions(payload) {
    return {
      method: "POST",
      // Tránh lỗi CORS Preflight trên trình duyệt
      headers: {
        "Content-Type": "text/plain;charset=utf-8", 
      },
      body: JSON.stringify(payload)
    };
  }

  /**
   * 🚀 GỬI DỮ LIỆU (Thêm dòng mới vào Sheet chỉ định)
   * 
   * @param {String} sheetName - Tên của trang tính (VD: "Trang tính 1")
   * @param {Object} data - Dữ liệu cần thêm { "A": "Giá trị", "B": "..." }
   * @returns {Promise<Object>} Phản hồi đầy đủ từ server gồm:
   *  - status: "success" hoặc "error"
   *  - added_rows: Số dòng đã thêm
   *  - results: { row: Vị trí dòng, data: { Object chứa dữ liệu } }
   */
  static async addData(sheetName, data) {
    if (!sheetName) throw new Error("Tên Sheet không được để trống!");
    if (!data || Object.keys(data).length === 0) throw new Error("Dữ liệu không được để trống!");

    const payload = {
      action: "add",
      sheet: sheetName,
      data: data
    };

    try {
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      const result = await response.json();
      
      // Nếu Apps Script trả về lỗi
      if (result.status === "error") {
        throw new Error(result.message || "Lỗi không xác định từ Google Sheets");
      }
      
      // TRẢ VỀ TOÀN BỘ DỮ LIỆU PHẢN HỒI
      return result; 
    } catch (error) {
      console.error("❌ Lỗi khi gửi dữ liệu lên Google Sheets:", error);
      throw error;
    }
  }

  /**
   * ⚡ LẤY DỮ LIỆU (Đọc toàn bộ dữ liệu từ Sheet chỉ định)
   * 
   * @param {String} sheetName - Tên của trang tính (VD: "Trang tính 1")
   * @returns {Promise<Object>} Phản hồi đầy đủ từ server gồm:
   *  - status: "success" hoặc "error"
   *  - total_rows: Tổng số dòng đang có
   *  - results: [ Mảng các object chứa { row, data } đã được đảo ngược (mới nhất xếp trước) ]
   */
  static async getData(sheetName) {
    if (!sheetName) throw new Error("Tên Sheet không được để trống!");

    const payload = {
      action: "get",
      sheet: sheetName
    };

    try {
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      const result = await response.json();
      
      // Nếu Apps Script trả về lỗi
      if (result.status === "error") {
        throw new Error(result.message || "Không thể tải dữ liệu hoặc Sheet không tồn tại");
      }
      
      // TRẢ VỀ TOÀN BỘ DỮ LIỆU PHẢN HỒI
      return result; 
    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu từ Google Sheets:", error);
      throw error;
    }
  }
}

// =========================================================
// XUẤT MODULE (Tương thích đa môi trường: Node.js, React, HTML thuần)
// =========================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThanhToanAPI;
} else if (typeof exports !== 'undefined') {
  exports.ThanhToanAPI = ThanhToanAPI;
} else if (typeof window !== 'undefined') {
  window.ThanhToanAPI = ThanhToanAPI;
}
