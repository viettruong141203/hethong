const API_URL = "https://script.google.com/macros/s/AKfycbx2n6BQsV1FX1MBeczJyTTC4I0cb54vMme0K8MzZN7hRnaENIP4X46pqSlugKUzc66FPg/exec";
const $ = id => document.getElementById(id);

$('bUp').addEventListener('click', async function() {
    let file = $('fIn').files[0];
    if (!file) return alert("Vui lòng chọn file!");
    
    if (file.size > 100 * 1024 * 1024) {
        return alert("❌ Kích thước file vượt quá 100MB!");
    }
    
    $('bUp').disabled = true;
    $('res').style.display = 'none';
    $('progressContainer').style.display = 'none';
    $('progressBar').style.width = '0%';
    $('progressText').textContent = '0%';
    $('load').style.display = 'block';

    try {
        $('load').textContent = "⏳ Đang thiết lập đường ống tải file với Google...";
        
        let initRes = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "initUpload",
                filename: file.name,
                mimeType: file.type,
                // Lấy chính xác địa chỉ web của bạn (Github Pages) để xin quyền Google
                origin: window.location.origin 
            })
        });
        
        let initData = await initRes.json();
        if (initData.status !== "success") throw new Error(initData.message);

        $('load').style.display = 'none';
        $('progressContainer').style.display = 'block';
        
        let uploadUrl = initData.uploadUrl;
        let type = initData.type;

        let xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                let percent = Math.round((e.loaded / e.total) * 100);
                $('progressBar').style.width = percent + '%';
                let loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
                let totalMB = (e.total / (1024 * 1024)).toFixed(1);
                $('progressText').textContent = `${percent}% (${loadedMB} MB / ${totalMB} MB)`;
            }
        };
        
        // Bắt lỗi triệt để trong quá trình nhận kết quả
        xhr.onload = function() {
            $('bUp').disabled = false;
            $('progressContainer').style.display = 'none';
            
            try {
                if (xhr.status === 200 || xhr.status === 201 || xhr.status === 308) {
                    let response = JSON.parse(xhr.responseText);
                    if (!response.id) throw new Error("Google không trả về ID file.");
                    
                    let fileId = response.id;
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
                    throw new Error("Lỗi đẩy file: " + xhr.statusText);
                }
            } catch (parseError) {
                $('res').className = "err";
                $('res').innerHTML = `<strong>❌ File đã lưu nhưng web bị lỗi đọc ID:</strong> ${parseError.message}`;
                $('res').style.display = 'block';
            }
        };
        
        xhr.onerror = function() {
            throw new Error("Mạng bị ngắt kết nối giữa chừng.");
        };
        
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
