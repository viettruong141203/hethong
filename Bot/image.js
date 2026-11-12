const API_URL = "https://script.google.com/macros/s/AKfycbz1VSNxtdcDVs4ocUBQlzgBKiVrB-WmplJqNiCH3bFS3IGj-w0bx11muCImJr9a0WJMLg/exec";
const $ = id => document.getElementById(id);

// Cài đặt URL cho Form
document.addEventListener("DOMContentLoaded", () => {
    $('uploadForm').action = API_URL;
});

// Quản lý UI
function setProcessingState(msg) {
    ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = true);
    $('load').textContent = msg; $('load').style.display = 'block'; $('res').style.display = 'none';
}

function resetProcessingState() {
    ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = false);
    $('load').style.display = 'none'; $('res').style.display = 'block';
}

// -----------------------------------------
// 1. LỆNH UPLOAD (Lắng nghe Iframe)
// -----------------------------------------
$('uploadForm').addEventListener('submit', function(e) {
    let file = $('fIn').files[0];
    if (!file) {
        e.preventDefault();
        return alert("Vui lòng chọn file!");
    }
    if (file.size > 50 * 1024 * 1024) {
        e.preventDefault();
        return alert("❌ File vượt quá 50MB!");
    }
    setProcessingState("⏳ Đang truyền tải bản gốc lên Drive (Chế độ siêu tốc)...");
});

window.addEventListener("message", function(event) {
    let res = event.data;
    if (!res || !res.status) return; // Bỏ qua nếu không phải dữ liệu API

    resetProcessingState();
    if (res.status === "success") {
        let isVideo = res.category === "VIDEO";
        let mediaTag = isVideo 
            ? `<video controls style="width:100%; border-radius:6px; margin-top:10px;"><source src="${res.fileUrl}" type="video/mp4">Trình duyệt không hỗ trợ.</video>`
            : "";

        $('res').className = "ok";
        $('res').innerHTML = `
            <strong>✅ Tải lên thành công!</strong><br>
            - Loại: ${res.category} | ID: <b>${res.fileName}</b><br>
            - Link Trực Tiếp: <a href="${res.fileUrl}" target="_blank">Xem ngay</a>
            ${mediaTag}
        `;
    } else {
        $('res').className = "err";
        $('res').innerHTML = `<strong>❌ Lỗi Server:</strong> ${res.message}`;
    }
});

// -----------------------------------------
// 2. LỆNH GỌI API CHUNG (CHO GET / CHECK)
// -----------------------------------------
async function callAPI(payload, loadingMsg) {
    setProcessingState(loadingMsg);
    try {
        let req = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: payload
        });
        let res = await req.json();
        if (res.status !== "success") throw new Error(res.message);
        $('res').className = "ok";
        return res;
    } catch (err) {
        $('res').className = "err";
        $('res').innerHTML = `<strong>❌ Lỗi:</strong> ${err.message || "Mất kết nối mạng."}`;
        return null;
    } finally {
        resetProcessingState();
    }
}

// 2. LỆNH CHECK
async function checkFile() {
    let id = $('sId').value.trim();
    if (!id) return alert("Vui lòng nhập ID!");

    let res = await callAPI(JSON.stringify({ action: "check", id: id }), "⏳ Đang tìm kiếm ID...");
    if (res) $('res').innerHTML = `
        <strong>✅ Tìm thấy File!</strong><br>
        - Thuộc Sheet: ${res.data.category} | Thời gian: ${res.data.time}<br>
        - Link Truyền Phát: <a href="${res.data.url}" target="_blank">Mở File (${res.data.fileName})</a>
    `;
}

// 3. LỆNH GET
async function getAll() {
    let res = await callAPI(JSON.stringify({ action: "get" }), "⏳ Đang đồng bộ dữ liệu...");
    if (!res) return;

    let html = `<strong>✅ Đồng bộ thành công!</strong><hr>`;
    let buildList = (title, arr) => {
        let h = `<h4>${title} (${arr.length})</h4><ul style="padding-left:20px;margin-top:5px">`;
        if(!arr.length) return h + `<li>Trống.</li></ul>`;
        arr.forEach(i => h += `<li>[${i.time}] <b>${i.id}</b> - <a href="${i.url}" target="_blank">Phát File</a></li>`);
        return h + `</ul>`;
    };

    $('res').innerHTML = html + buildList("🖼️ IMAGE", res.data.images) + buildList("🎥 VIDEO", res.data.videos);
}
