const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

let isSyncing = false;
let syncTimeout = null;

const DataManager = {
  getOffline(sheetName) {
    const cached = localStorage.getItem("app_data_" + sheetName);
    return cached ? JSON.parse(cached) : null;
  },

  async get(sheetName) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ "sheet": sheetName, "action": "get" })
      });
      const data = await response.json();
      return (data.status === "success" && data.all_data) ? data.all_data : null;
    } catch (error) { return null; }
  },

  async add(sheetName, dataObj) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ "sheet": sheetName, "action": "add", ...dataObj })
      });
      const result = await response.json();
      return { success: (result.status === "success" || result.message === "Thành công") };
    } catch (error) { return { success: false, message: "Lỗi kết nối mạng" }; }
  },

  async syncMultipleSheets() {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ "action": "get_multiple", "sheets": ["Home", "Face ID", "Ngân hàng"] })
      });
      const result = await response.json();
      
      if (result.status === "success") {
        const sheetsData = result.data || result.all_data || result;
        ["Home", "Face ID", "Ngân hàng"].forEach(sheet => {
          if (sheetsData[sheet]) localStorage.setItem("app_data_" + sheet, JSON.stringify(sheetsData[sheet]));
        });
        return sheetsData;
      }
    } catch (error) { console.error("Lỗi đồng bộ ngầm:", error); }
    return null;
  },

  startBackgroundWorker(callbackHome) {
    isSyncing = true;
    const offlineHome = this.getOffline("Home");
    if (offlineHome && callbackHome) callbackHome(offlineHome);

    const loop = async () => {
      if (!isSyncing) return;
      const sheetsData = await this.syncMultipleSheets();
      if (sheetsData && sheetsData["Home"] && callbackHome) callbackHome(sheetsData["Home"]);
      if (isSyncing) syncTimeout = setTimeout(loop, 5000); 
    };
    loop();
  },

  stopBackgroundWorker() {
    isSyncing = false;
    if (syncTimeout) clearTimeout(syncTimeout);
  },
  
  clearCache() { localStorage.clear(); }
};
