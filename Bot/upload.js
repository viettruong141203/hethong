// Thay đổi lại Web App URL
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
// 1. LỆNH UPLOAD FILE (TỐI ƯU SIÊU TỐC - FORM DATA BẢN GỐC)
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

    // Thay vì dùng Base64, dùng FormData đẩy thẳng file gốc nguyên vẹn lên
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file); // Đính kèm thẳng file nhị phân

    // Bắn request
    fetch(WEB_APP_URL, {
        method: "POST",
        body: formData // Truyền raw thay vì JSON.stringify
    })
    .then(res => res.json())
    .then(data => {
        resetProcessingState();
        if (data.status === "success") {
            resultDiv.className = "success";
            resultDiv.innerHTML = `
                <strong>✅ Tải bản gốc thành công (Siêu tốc)!</strong><br>
                - <strong>Loại:</strong> ${data.category}<br>
                - <strong>ID (Tên mới):</strong> ${data.fileName}<br>
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
        resultDiv.innerHTML = `<strong>❌ Lỗi kết nối mạng.</strong> Không thể truyền tải file.`;
    });
}

// ... (Giữ nguyên các hàm checkDataById() và fetchAllData() ở phần dưới)
