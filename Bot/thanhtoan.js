const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby6NI-jU7bgR-W18zG2iVCqmAeGVqoZmmZqlsWFXf5lzJSMT3q5J2mP45Or_buOzjyb0Q/exec";

class ThanhToanAPI {
  static _getFetchOptions(payload) {
    return {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    };
  }

  static async addData(sheetName, data) {
    if (!sheetName) throw new Error("Tên Sheet không được để trống!");
    if (!data || Object.keys(data).length === 0) throw new Error("Dữ liệu không được để trống!");

    const payload = { action: "add", sheet: sheetName.trim(), data: data };

    try {
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);
      return result; 
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      throw error;
    }
  }

  static async getData(sheetName) {
    if (!sheetName) throw new Error("Tên Sheet không được để trống!");

    const payload = { action: "get", sheet: sheetName.trim() };

    try {
      const response = await fetch(WEB_APP_URL, this._getFetchOptions(payload));
      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);
      return result; 
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      throw error;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThanhToanAPI;
} else if (typeof exports !== 'undefined') {
  exports.ThanhToanAPI = ThanhToanAPI;
} else if (typeof window !== 'undefined') {
  window.ThanhToanAPI = ThanhToanAPI;
}
