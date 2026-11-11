const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz1VSNxtdcDVs4ocUBQlzgBKiVrB-WmplJqNiCH3bFS3IGj-w0bx11muCImJr9a0WJMLg/exec";

const resultDiv = document.getElementById('result');
const loadingText = document.getElementById('loadingText');

function getButtons() {
    return [document.getElementById('uploadBtn'), document.getElementById('checkBtn'), document.getElementById('fetchBtn')];
}

function setProcessingState(message) {
    getButtons().forEach(btn => btn.disabled = true);
    loadingText.textContent = message;
    loadingText.style.display = 'block';
    resultDiv.style.display = 'none';
}

function resetProcessingState() {
    getButtons().forEach(btn => btn.disabled = false);
    loadingText.style.display = 'none';
    resultDiv.style.display = 'block';
}

// -----------------------------------------
// 1. LỆNH UPLOAD (Dùng FormData truyền tải Binary Siêu Tốc)
// -----------------------------------------
function uploadFile() {
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files.length) {
        alert("Vui lòng chọn file trước khi tải lên!");
        return;
    }

    const file = fileInput.files[0];
    if (file.size > 50 * 1024 * 1024) {
        alert("❌ File quá lớn. Vui lòng chọn file dưới 50MB.");
        return;
    }

    setProcessingState("⏳ Đang truyền tải file gốc lên Drive (Chế độ nhị phân tốc độ cao)...");

    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file); // Đính kèm file gốc 100%

    fetch(WEB_APP_URL, { 
        method: "POST", 
        body: formData 
    })
    .then(res => res.json())
    .then(data => {
        resetProcessingState();
        if (data.status === "success") {
            resultDiv.className = "success";
            resultDiv.innerHTML = `
                <strong>✅ Tải bản gốc thành công!</strong><br>
                - <strong>Loại:</strong> ${data.category}<br>
                - <strong>ID (Tên file):</strong> ${data.fileName}<br>
                - <strong>Thời gian:</strong> ${data.time}<br>
                - <strong>Link:</strong> <a href="${data.fileUrl}" target="_blank">Mở File</a>
            `;
        } else {
            resultDiv.className = "error";
            resultDiv.innerHTML = `<strong>❌ Lỗi Server:</strong> ${data.message}`;
        }
    })
    .catch(error => {
        resetProcessingState();
        resultDiv.className = "error";
        resultDiv.innerHTML = `<strong>❌ Lỗi kết nối mạng.</strong> File quá nặng hoặc rớt mạng.`;
    });
}

// -----------------------------------------
// 2. LỆNH CHECK (Gửi chuẩn JSON text/plain)
// -----------------------------------------
function checkDataById() {
    const searchId = document.getElementById('searchId').value.trim();
    if (!searchId) { alert("Vui lòng nhập ID cần kiểm tra!"); return; }

    const payload = { action: "check", sheet: "", id: searchId };
    setProcessingState("⏳ Đang tìm kiếm ID trên hệ thống...");

    fetch(WEB_APP_URL, { 
        method: "POST", 
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Ép kiểu để tránh lỗi CORS của Google
        body: JSON.stringify(payload) 
    })
    .then(res => res.json())
    .then(data => {
        resetProcessingState();
        if (data.status === "success") {
            resultDiv.className = "success";
            resultDiv.innerHTML = `
                <strong>✅ Đã tìm thấy File!</strong><br>
                - Loại: ${data.data.category}<br>
                - ID: ${data.data.id}<br>
                - Tên file: ${data.data.fileName}<br>
                - Thời gian: ${data.data.time}<br>
                - Link: <a href="${data.data.url}" target="_blank">Xem File</a>
            `;
        } else {
            resultDiv.className = "error";
            resultDiv.innerHTML = `<strong>❌ Không tìm thấy:</strong> ${data.message}`;
        }
    })
    .catch(error => {
        resetProcessingState();
        resultDiv.className = "error";
        resultDiv.innerHTML = `<strong>❌ Lỗi kết nối mạng.</strong>`;
    });
}

// -----------------------------------------
// 3. LỆNH GET (Gửi chuẩn JSON text/plain)
// -----------------------------------------
function fetchAllData() {
    const payload = { action: "get", sheet: "" };
    setProcessingState("⏳ Đang lấy toàn bộ dữ liệu từ Google Sheet...");

    fetch(WEB_APP_URL, { 
        method: "POST", 
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload) 
    })
    .then(res => res.json())
    .then(data => {
        resetProcessingState();
        if (data.status === "success") {
            resultDiv.className = "success";
            let html = `<strong>✅ Cập nhật dữ liệu thành công!</strong><hr>`;
            
            html += `<h4>🖼️ Dữ liệu IMAGE (${data.data.images.length} file)</h4><ul>`;
            if(data.data.images.length === 0) html += `<li>Chưa có dữ liệu.</li>`;
            data.data.images.forEach(img => {
                html += `<li>[${img.time}] <strong>${img.id}</strong> - <a href="${img.url}" target="_blank">Mở Link</a></li>`;
            });
            html += `</ul>`;

            html += `<h4>🎥 Dữ liệu VIDEO (${data.data.videos.length} file)</h4><ul>`;
            if(data.data.videos.length === 0) html += `<li>Chưa có dữ liệu.</li>`;
            data.data.videos.forEach(vid => {
                html += `<li>[${vid.time}] <strong>${vid.id}</strong> - <a href="${vid.url}" target="_blank">Mở Link</a></li>`;
            });
            html += `</ul>`;

            resultDiv.innerHTML = html;
        } else {
            resultDiv.className = "error";
            resultDiv.innerHTML = `<strong>❌ Lỗi Server:</strong> ${data.message}`;
        }
    })
    .catch(error => {
        resetProcessingState();
        resultDiv.className = "error";
        resultDiv.innerHTML = `<strong>❌ Lỗi kết nối mạng.</strong>`;
    });
}
