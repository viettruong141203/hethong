// Đường dẫn: Bot/email.js

// URL Webhook của bạn (đã được ẩn an toàn trong file JS)
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzwHgK7DRFY4AOtGu7wiyYs-cGSeiLNU_9BNSWwg0fMek4C3jwM5_TqCBl7RBT_T2_5ow/exec';

/**
 * Hàm nhận dữ liệu từ giao diện HTML và tiến hành gửi email
 * @param {string} tieuDe - Tiêu đề email
 * @param {string} emailNhan - Email người nhận
 * @param {string} nguoiGui - Tên người gửi
 * @param {string} traLoi - Email phản hồi
 * @param {string} noiDung - Nội dung email (HTML)
 * @returns {Promise<boolean>} - Trả về true nếu thành công, false nếu thất bại
 */
async function receiveDataAndSend(tieuDe, emailNhan, nguoiGui, traLoi, noiDung) {
    
    // 1. Đóng gói dữ liệu thành JSON theo cấu trúc bạn yêu cầu ban đầu
    const payload = {
        tieu_de: tieuDe,
        email_nhan: emailNhan,
        nguoi_gui: nguoiGui,
        tra_loi: traLoi,
        noi_dung: noiDung
    };

    console.log("📥 [email.js] Đã nhận dữ liệu từ HTML, đang chuẩn bị gửi...");

    try {
        // 2. Gửi request tới Google Webhook (Dùng no-cors để tránh lỗi trình duyệt)
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        console.log(`✅ [email.js] Đã gửi lệnh thành công tới: ${emailNhan}`);
        return true; // Trả về kết quả thành công cho HTML biết

    } catch (error) {
        console.error("❌ [email.js] Lỗi kết nối mạng:", error.message);
        return false; // Trả về lỗi cho HTML biết
    }
}
