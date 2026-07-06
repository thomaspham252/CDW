package com.project.backend.service.async;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class NotificationAsyncService {

    /**
     * Mô phỏng gửi email/thông báo xác nhận đơn hàng bất đồng bộ ở background.
     * Luồng xử lý chính của controller sẽ trả kết quả ngay lập tức mà không cần đợi hàm này hoàn thành.
     */
    @Async
    public void sendOrderNotification(Integer orderId, String customerEmail, BigDecimal totalAmount) {
        String threadName = Thread.currentThread().getName();
        System.out.println("[ASYNC START] Bắt đầu xử lý thông báo nền cho đơn hàng #" + orderId 
                + " (Email: " + customerEmail + ") trên luồng: " + threadName);

        try {
            // Giả lập thời gian gửi email hoặc tạo PDF hóa đơn (mất 4 giây chạy ngầm)
            Thread.sleep(4000);
            
            System.out.println("[ASYNC PROGRESS] Đang gửi email xác nhận hóa đơn trị giá " 
                    + totalAmount + "đ...");
            Thread.sleep(2000);

            System.out.println("[ASYNC SUCCESS] Đã gửi email thành công cho đơn hàng #" + orderId 
                    + " tới " + customerEmail + " trên luồng: " + threadName);
        } catch (InterruptedException e) {
            System.err.println("[ASYNC ERROR] Tiến trình bất đồng bộ bị gián đoạn: " + e.getMessage());
            Thread.currentThread().interrupt();
        }
    }
}
