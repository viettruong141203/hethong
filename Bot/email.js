// email.js (Đóng vai trò là Backend Server)
const express = require('express');
const cors = require('cors');

const app = express();

// Bật CORS để cho phép HTML gọi tới API này
app.use(cors());
// Cấu hình để Server đọc được dữ liệu JSON từ HTML gửi lên
app.use(express.json());

// Đường dẫn Google Webhook của bạn
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzwHgK7DRFY4AOtGu7wiyYs-cGSeiLNU_9BNSWwg0fMek4C3jwM5_TqCBl7RBT_T2_5ow/exec';

// Tạo một API endpoint: POST /api/send-email
app.post('/api/send-email', async (req, res) => {
    // Nhận dữ liệu từ HTML
    const payload = req.body; 
    console.log("📥 Nhận được yêu cầu gửi email tới:", payload.email_nhan);

    try {
        // Chuyển tiếp dữ liệu đó tới Google Webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        if (response.ok) {
            console.log("✅ Đã chuyển tiếp thành công!");
            // Trả lời lại cho HTML biết là đã thành công
            res.status(200).json({ success: true, message: 'Gửi email thành công!' });
        } else {
            console.error("❌ Lỗi từ Google Webhook:", response.status);
            res.status(500).json({ success: false, message: 'Lỗi khi gửi tới Webhook' });
        }
    } catch (error) {
        console.error("❌ Lỗi Server:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi kết nối mạng: ' + error.message });
    }
});

// Chạy server ở cổng 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server email.js đang chạy tại: http://localhost:${PORT}`);
    console.log(`Đang chờ HTML gửi dữ liệu tới [POST] http://localhost:${PORT}/api/send-email ...`);
});
