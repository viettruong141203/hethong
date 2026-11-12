const API_URL = "https://script.google.com/macros/s/AKfycbz1VSNxtdcDVs4ocUBQlzgBKiVrB-WmplJqNiCH3bFS3IGj-w0bx11muCImJr9a0WJMLg/exec";
const $ = id => document.getElementById(id);

// --- HÀM XỬ LÝ GIAO DIỆN & GỌI API CHUNG ---
async function callAPI(payload, loadingMsg, isFormData = false) {
    ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = true);
    $('load').textContent = loadingMsg; $('load').style.display = 'block'; $('res').style.display = 'none';

    try {
        let options = { method: "POST", body: payload };
        if (!isFormData) options.headers = { "Content-Type": "text/plain;charset=utf-8" };
        
        let req = await fetch(API_URL, options);
        let res = await req.json();
        
        if (res.status !== "success") throw new Error(res.message);
        $('res').className = "ok";
        return res;
    } catch (err) {
        $('res').className = "err";
        $('res').innerHTML = `<strong>❌ Lỗi:</strong> ${err.message || "Mất kết nối mạng."}`;
        return null;
    } finally {
        ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = false);
        $('load').style.display = 'none'; $('res').style.display = 'block';
    }
}

// 1. LỆNH UPLOAD
async function uploadFile() {
    let file = $('fIn').files[0];
    if (!file) return alert("Vui lòng chọn file!");
    if (file.size > 50 * 1024 * 1024) return alert("❌ File vượt quá 50MB!");

    let fd = new FormData();
    fd.append("action", "upload");
    fd.append("file", file);

    let res = await callAPI(fd, "⏳ Đang tải lên bản nhị phân gốc...", true);
    if (res) $('res').innerHTML = `
        <strong>✅ Tải lên thành công!</strong><br>
        - Loại: ${res.category} | ID: <b>${res.fileName}</b><br>
        - Link: <a href="${res.fileUrl}" target="_blank">Xem ngay</a>
    `;
}

// 2. LỆNH CHECK
async function checkFile() {
    let id = $('sId').value.trim();
    if (!id) return alert("Vui lòng nhập ID!");

    let res = await callAPI(JSON.stringify({ action: "check", id: id }), "⏳ Đang tìm kiếm ID...");
    if (res) $('res').innerHTML = `
        <strong>✅ Tìm thấy File!</strong><br>
        - Thuộc Sheet: ${res.data.category} | Thời gian: ${res.data.time}<br>
        - Link: <a href="${res.data.url}" target="_blank">Mở File (${res.data.fileName})</a>
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
        arr.forEach(i => h += `<li>[${i.time}] <b>${i.id}</b> - <a href="${i.url}" target="_blank">Xem</a></li>`);
        return h + `</ul>`;
    };

    $('res').innerHTML = html + buildList("🖼️ IMAGE", res.data.images) + buildList("🎥 VIDEO", res.data.videos);
}
