// 1. HÀM TẢI FILE LÊN (POST)
function uploadFile() {
    const webAppUrl = document.getElementById('webAppUrl').value.trim();
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingText = document.getElementById('loadingText');
    const uploadBtn = document.getElementById('uploadBtn');
    const fetchBtn = document.getElementById('fetchBtn');

    if (!fileInput.files.length) {
        alert("Vui lòng chọn file trước khi tải lên!");
        return;
    }

    const file = fileInput.files[0];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    if (file.size > MAX_FILE_SIZE) {
        alert(`❌ File quá lớn (${(file.size / (1024*1024)).toFixed(1)} MB). Vui lòng chọn file dưới 50MB!`);
        return;
    }

    const reader = new FileReader();

    uploadBtn.disabled = true;
    fetchBtn.disabled = true;
    loadingText.textContent = "⏳ Đang tải file lên Drive, vui lòng chờ...";
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
            uploadBtn.disabled = false;
            fetchBtn.disabled = false;
            loadingText.style.display = 'none';
            resultDiv.style.display = 'block';

            if (data.status === "success") {
                resultDiv.className = "success";
                resultDiv.innerHTML = `
                    <strong>✅ Tải lên thành công!</strong><br>
                    - <strong>Loại:</strong> ${data.category}<br>
                    - <strong>Tên file (ID):</strong> ${data.fileName}<br>
                    - <strong>Thời gian:</strong> ${data.time}<br>
                    - <strong>Link Drive:</strong> <a href="${data.fileUrl}" target="_blank">Xem file</a>
                `;
            } else {
                resultDiv.className = "error";
                resultDiv.innerHTML = `<strong>❌ Lỗi Server:</strong> ${data.message}`;
            }
        })
        .catch(error => {
            uploadBtn.disabled = false;
            fetchBtn.disabled = false;
            loadingText.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.className = "error";
            resultDiv.innerHTML = `<strong>❌ Lỗi kết nối:</strong> Không thể tải file.`;
        });
    };

    reader.readAsDataURL(file);
}

// 2. HÀM LẤY TOÀN BỘ DỮ LIỆU (GET)
function fetchAllData() {
    const webAppUrl = document.getElementById('webAppUrl').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingText = document.getElementById('loadingText');
    const uploadBtn = document.getElementById('uploadBtn');
    const fetchBtn = document.getElementById('fetchBtn');

    uploadBtn.disabled = true;
    fetchBtn.disabled = true;
    loadingText.textContent = "⏳ Đang lấy dữ liệu từ Google Sheet...";
    loadingText.style.display = 'block';
    resultDiv.style.display = 'none';

    fetch(webAppUrl)
        .then(response => response.json())
        .then(data => {
            uploadBtn.disabled = false;
            fetchBtn.disabled = false;
            loadingText.style.display = 'none';
            
            if (data.status === "success") {
                console.log("Dữ liệu Sheet Ảnh:", data.data.images);
                console.log("Dữ liệu Sheet Video:", data.data.videos);
                
                resultDiv.style.display = 'block';
                resultDiv.className = "success";
                resultDiv.innerHTML = `
                    <strong>✅ Lấy dữ liệu thành công!</strong><br>
                    - Tổng số Ảnh: ${data.data.images.length}<br>
                    - Tổng số Video: ${data.data.videos.length}<br>
                    <em>* Nhấn F12 (Console) để xem toàn bộ danh sách chi tiết.</em>
                `;
            } else {
                alert("Lỗi server: " + data.message);
            }
        })
        .catch(error => {
            uploadBtn.disabled = false;
            fetchBtn.disabled = false;
            loadingText.style.display = 'none';
            alert("❌ Lỗi kết nối khi lấy dữ liệu.");
        });
}
