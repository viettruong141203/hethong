const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU2-uP0jUUia8w74BBQ7U78OUn3d_SE7cEd_LBZJbq2b2g4HCJyFRAOLKMU9p2zb0F/exec";

async function fetchMultipleSheets() {
  try {
    const payload = {
      "action": "get_multiple",
      "sheets": ["Home", "Face ID", "Ngân hàng"]
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST", 
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.status === "success") {
      // Hỗ trợ cả 2 định dạng trả về từ Google Apps Script
      const sheetsData = result.data || result;
      postMessage({ type: 'SYNC_SUCCESS', data: sheetsData });
    }
  } catch (error) {
    postMessage({ type: 'SYNC_ERROR', message: error.message });
  }
}

function startLoop() {
  setInterval(() => {
    fetchMultipleSheets();
  }, 2000); // Lặp lại mỗi 2 giây
}

self.onmessage = function(e) {
  if (e.data === 'START') {
    fetchMultipleSheets(); // Chạy ngay lần đầu
    startLoop(); // Kích hoạt vòng lặp
  }
};
