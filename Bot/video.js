const API_URL = "https://script.google.com/macros/s/AKfycbx2n6BQsV1FX1MBeczJyTTC4I0cb54vMme0K8MzZN7hRnaENIP4X46pqSlugKUzc66FPg/exec"; // Cập nhật link mới nếu cần
const $ = id => document.getElementById(id);

$('bUp').addEventListener('click', async function() {
    let file = $('fIn').files[0];
    if (!file) return alert("Vui lòng chọn file!");
    
    // Đặt lại giao diện UI
    $('bUp').disabled = true;
    $('res').style.display = 'none';
    $('progressContainer').style.display = 'none';
    $('progressBar').style.width = '0%';
    $('progressText').textContent = '0%';
    $('load').style.display = 'block';

    try {
        // BƯỚC 1: XIN GIẤY PHÉP VÀ ĐƯỜNG ỐNG TRUYỀN TẢI TỪ BACKEND
        $('load').textContent = "⏳ Đang thiết lập đường ống tải file với Google...";
        
        let initRes = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "initUpload",
                filename: file.name,
                mimeType: file.type
            })
        });
        let initData = await initRes.json();
        
        if (initData.status !== "success") throw new Error(initData.message);

        // BƯỚC 2: ĐẨY TRỰC TIẾP FILE NẶNG VÀO SERVER GOOGLE TỪ TRÌNH DUYỆT
        $('load').style.display = 'none';
        $('progressContainer').style.display = 'block';
        
        let uploadUrl = initData.uploadUrl;
        let type = initData.type;

        let xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        
        // Theo dõi quá trình tải %
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                let percent = Math.round((e.loaded / e.total) * 100);
                $('progressBar').style.width = percent + '%';
                
                let loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
                let totalMB = (e.total / (1024 * 1024)).toFixed(1);
                $('progressText').textContent = `${percent}% (${loadedMB} MB / ${totalMB} MB)`;
            }
        };
        
        // Khi tải xong hoàn tất
        xhr.onload = function() {
            $('bUp').disabled = false;
            $('progressContainer').style.display = 'none';
            
            if (xhr.status === 200 || xhr.status === 201) {
                let response = JSON.parse(xhr.responseText);
                let fileId = response.id; // Lấy ID thực tế từ Drive trả về
                
                // Trả về định dạng Link xem trực tiếp (URL Gốc)
                let finalUrl = type === "IMAGE" 
                    ? `https://drive.google.com/uc?export=view&id=${fileId}` 
                    : `https://drive.google.com/file/d/${fileId}/view`;

                $('res').className = "ok";
                $('res').innerHTML = `
                    <strong>✅ Thành công! URL gốc của file:</strong>
                    <div class="url-box">${finalUrl}</div>
                    <div style="margin-top:12px; text-align:center;">
                        <a href="${finalUrl}" target="_blank" style="color:#166534; font-weight:bold; text-decoration:none;">👉 Bấm vào đây để xem trực tiếp</a>
                    </div>
                `;
                $('res').style.display = 'block';
            } else {
                throw new Error("Lỗi khi đẩy file vào Drive: " + xhr.responseText);
            }
        };
        
        xhr.onerror = function() {
            throw new Error("Mạng bị ngắt kết nối giữa chừng.");
        };
        
        // Bắt đầu bơm file vào ống!
        xhr.send(file);

    } catch (err) {
        $('bUp').disabled = false;
        $('load').style.display = 'none';
        $('progressContainer').style.display = 'none';
        $('res').className = "err";
        $('res').innerHTML = `<strong>❌ Lỗi:</strong> ${err.message}`;
        $('res').style.display = 'block';
    }
});
