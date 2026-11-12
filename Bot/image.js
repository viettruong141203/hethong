const API_URL = "https://script.google.com/macros/s/AKfycbz1VSNxtdcDVs4ocUBQlzgBKiVrB-WmplJqNiCH3bFS3IGj-w0bx11muCImJr9a0WJMLg/exec";
const $ = id => document.getElementById(id);

// --- HÀM GỌI API CHUNG ---
async function callAPI(payload, loadingMsg) {
    ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = true);
    $('load').textContent = loadingMsg; $('load').style.display = 'block'; $('res').style.display = 'none';

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
        $('res').innerHTML = `<strong>❌ Lỗi:</strong> ${err.message || "Kết nối mạng không ổn định hoặc tệp quá lớn."}`;
        return null;
    } finally {
        ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = false);
        $('load').style.display = 'none'; $('res').style.display = 'block';
    }
}

// 1. LỆNH UPLOAD
function uploadFile() {
    let file = $('fIn').files[0];
    if (!file) return alert("Vui lòng chọn file!");
    
    // Giữ an toàn ở mức < 20MB cho Base64 để Apps Script không bị tràn RAM báo lỗi sập
    if (file.size > 25 * 1024 * 1024) return alert("❌ Để đảm bảo ổn định, vui lòng chọn file dưới 25MB!");

    let reader = new FileReader();
    ['bUp', 'bChk', 'bGet'].forEach(id => $(id).disabled = true);
    $('load').textContent = "⏳ Đang mã hóa file chuẩn bị gửi...";
    $('load').style.display = 'block'; $('res').style.display = 'none';

    reader.onload = async function () {
        let payload = JSON.stringify({
            action: "upload",
            filename: file.name,
            mimeType: file.type,
            fileData: reader.result
        });

        let res = await callAPI(payload, "🚀 Đang truyền dữ liệu lên Google Drive...");
        if (res) {
            // Hiển thị iframe cho Video để phát bằng trình duyệt Drive chuẩn, hoặc img cho Ảnh
            let mediaTag = res.category === "VIDEO" 
                ? `<iframe src="${res.fileUrl}" style="width:100%; height:250px; border:none; border-radius:6px; margin-top:10px;" allow="autoplay"></iframe>` 
                : `<img src="${res.fileUrl}" style="width:100%; border-radius:6px; margin-top:10px;">`;

            $('res').innerHTML = `
                <strong>✅ Lưu bản gốc thành công!</strong><br>
                - Loại: ${res.category} | ID: <b>${res.fileName}</b><br>
                - Link Truyền Phát: <a href="${res.fileUrl}" target="_blank">Mở Lên</a>
                ${mediaTag}
            `;
        }
    };
    reader.readAsDataURL(file);
}

// 2. LỆNH CHECK
async function checkFile() {
    let id = $('sId').value.trim();
    if (!id) return alert("Vui lòng nhập ID!");

    let res = await callAPI(JSON.stringify({ action: "check", id: id }), "⏳ Đang truy xuất thông tin ID...");
    if (res) $('res').innerHTML = `
        <strong>✅ Đã tìm thấy file!</strong><br>
        - Phân loại: ${res.data.category} | Thời gian: ${res.data.time}<br>
        - Link Truyền Phát: <a href="${res.data.url}" target="_blank">Mở File (${res.data.fileName})</a>
    `;
}

// 3. LỆNH GET
async function getAll() {
    let res = await callAPI(JSON.stringify({ action: "get" }), "⏳ Đang đồng bộ toàn bộ dữ liệu...");
    if (!res) return;

    let html = `<strong>✅ Đồng bộ hoàn tất!</strong><hr>`;
    let buildList = (title, arr) => {
        let h = `<h4>${title} (${arr.length})</h4><ul style="padding-left:20px;margin-top:5px">`;
        if(!arr.length) return h + `<li>Chưa có dữ liệu.</li></ul>`;
        arr.forEach(i => h += `<li>[${i.time}] <b>${i.id}</b> - <a href="${i.url}" target="_blank">Xem File</a></li>`);
        return h + `</ul>`;
    };

    $('res').innerHTML = html + buildList("🖼️ Dữ liệu IMAGE", res.data.images) + buildList("🎥 Dữ liệu VIDEO", res.data.videos);
}
