// Cấu hình URL của Google Apps Script bạn vừa Deploy
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLcE6Omn3QKXFi1SBB7A4CtsEjr-iB_qNQ5qrjy5AHagHsjTufNFA9MNqUTmq0ggle/exec';

class PaymentAPI {
  /**
   * Hàm core để gửi request lên Google Apps Script
   * Sử dụng text/plain để tránh lỗi CORS Preflight trên trình duyệt
   */
  static async sendRequest(payload) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 1. Lệnh Tạo đơn hàng
   * Trả về: { success: true, data: { id, time, amount, content, status, paymentTime } }
   * @param {number} amount - Số tiền của đơn hàng (vd: 50000)
   * @returns {Promise<Object>}
   */
  static async add(amount) {
    return await this.sendRequest({ action: 'add', amount: amount });
  }

  /**
   * 2. Lệnh Kiểm tra trạng thái đơn
   * Trả về: { success: true, data: { id, time, amount, content, status, paymentTime } }
   * @param {string} id - Mã giao dịch (vd: "261110123456")
   * @returns {Promise<Object>}
   */
  static async check(id) {
    return await this.sendRequest({ action: 'check', id: id });
  }

  /**
   * 3. Lệnh Lấy chi tiết 1 đơn hàng
   * Trả về: { success: true, data: { id, time, amount, content, status, paymentTime } }
   * @param {string} id - Mã giao dịch
   * @returns {Promise<Object>}
   */
  static async get(id) {
    return await this.sendRequest({ action: 'get', id: id });
  }

  /**
   * 4. Lệnh Lấy danh sách toàn bộ đơn hàng
   * Trả về: { success: true, data: [ { id, time, amount, content, status, paymentTime }, ... ] }
   * @returns {Promise<Object>}
   */
  static async getAll() {
    return await this.sendRequest({ action: 'get' });
  }

  /**
   * 5. Lệnh Sửa đơn hàng thủ công
   * Trả về: { success: true, message: "...", data: { id, time, amount, content, status, paymentTime } }
   * @param {string} id - Mã giao dịch cần sửa
   * @param {Object} updateData - Object chứa dữ liệu cần sửa {amount, status, paymentTime}
   * @returns {Promise<Object>}
   */
  static async edit(id, updateData = {}) {
    const payload = { action: 'edit', id: id, ...updateData };
    return await this.sendRequest(payload);
  }
}

// Hỗ trợ dùng trực tiếp trên trình duyệt (HTML)
if (typeof window !== 'undefined') {
  window.PaymentAPI = PaymentAPI;
}

// Bỏ comment dòng dưới nếu bạn dùng trong môi trường module (React/Vue/Node.js)
// export default PaymentAPI;
