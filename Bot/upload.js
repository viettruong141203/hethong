// HÀM 1: TẢI FILE LÊN (POST)
function uploadFile() {
    const webAppUrl = document.getElementById('webAppUrl').value.trim();
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingText = document.getElementById('loadingText');
    const btnElements = [document.getElementById('uploadBtn'), document.getElementById('fetchBtn')];

    if (!fileInput.files.length) {
        alert("Vui lòng chọn file trước khi tải lên!");
        return;
    }

    const file = fileInput.files[0];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    if (file.size > MAX_FILE_SIZE) {
        alert(`❌ File quá lớn (${(file.size / (1024*1024)).toFixed(1)} MB). Google Apps Script chỉ hỗ trợ file < 50MB.`);
        return;
    }

    const reader = new FileReader();

    btnElements.forEach(btn => btn.disabled = true);
    loadingText.textContent = "⏳ Đang tải bản gốc lên Drive, vui lòng chờ...";
    loadingText.style.display = 'block';
    resultDiv.style.display = 'none';

    reader.onload = function () {
        const payload = {
            filename: file.name,
            mimeType: file.type,
            fileData: reader.result
        };

        fetch(webAppUrl, {
            method: "POST",
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            btnElements.forEach(btn => btn.disabled = false);
            loadingText.style.display = 'none';
            resultDiv.style.display = 'block';

            if (data.status === "success") {
                resultDiv.className = "success";
                resultDiv.innerHTML = `
                    <strong>✅ Tải lên thành công!</strong><br>
                    - <strong>Loại File:</strong> ${data.category}<br>
                    - <strong>Tên Mới (ID):</strong> ${data.fileName}<br>
                    - <strong>Thời Gian:</strong> ${data.time}<br>
                    - <strong>Link Drive:</strong> <a href="${data.fileUrl}" target="_blank">Mở File</a>
                `;
            } else {
                resultDiv.className = "error";
                resultDiv.innerHTML = `<strong>❌ Lỗi Server:</strong> ${data.message}`;
            }
        })
        .catch(error => {
            btnElements.forEach(btn => btn.disabled = false);
            loadingText.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.className = "error";
            resultDiv.innerHTML = `<strong>❌ Lỗi kết nối:</strong> Mạng yếu hoặc file quá nặng.`;
        });
    };

    reader.readAsDataURL(file);
}

// HÀM 2: LẤY TOÀN BỘ DỮ LIỆU (GET)
function fetchAllData() {
    const webAppUrl = document.getElementById('webAppUrl').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingText = document.getElementById('loadingText');
    const btnElements = [document.getElementById('uploadBtn'), document.getElementById('fetchBtn')];

    btnElements.forEach(btn => btn.disabled = true);
    loadingText.textContent = "⏳ Đang lấy dữ liệu từ Google Sheet...";
    loadingText.style.display = 'block';
    resultDiv.style.display = 'none';

    fetch(webAppUrl)
        .then(response => response.json())
        .then(data => {
            btnElements.forEach(btn => btn.disabled = false);
            loadingText.style.display = 'none';
            
            if (data.status === "success") {
                console.log("Dữ liệu Sheet Ảnh:", data.data.images);
                console.log("Dữ liệu Sheet Video:", data.data.videos);
                
                resultDiv.style.display = 'block';
                resultDiv.className = "success";
                resultDiv.innerHTML = `
                    <strong>✅ Lấy dữ liệu thành công!</strong><br>
                    - Tổng số Ảnh đã lưu: <strong>${data.data.images.length}</strong><br>
                    - Tổng số Video đã lưu: <strong>${data.data.videos.length}</strong><br>
                    <em>* Nhấn F12 (Console) để xem danh sách JSON chi tiết.</em>
                `;
            } else {
                alert("Lỗi server: " + data.message);
            }
        })
        .catch(error => {
            btnElements.forEach(btn => btn.disabled = false);
            loadingText.style.display = 'none';
            alert("❌ Lỗi kết nối khi lấy dữ liệu.");
        });
}
