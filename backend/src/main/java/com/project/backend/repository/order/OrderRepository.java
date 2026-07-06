package com.project.backend.repository.order;

import com.project.backend.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findAllByOrderByCreatedAtDesc();

    /** Thống kê doanh thu và số đơn theo từng tháng trong năm (bao gồm cả hủy) */
    @Query("""
        SELECT EXTRACT(MONTH FROM o.createdAt) AS month,
               SUM(CASE WHEN o.status <> 'cancelled' THEN o.totalAmount ELSE 0 END) AS revenue,
               COUNT(o.id) AS totalOrders,
               SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders
        FROM Order o
        WHERE EXTRACT(YEAR FROM o.createdAt) = :year
        GROUP BY EXTRACT(MONTH FROM o.createdAt)
        ORDER BY EXTRACT(MONTH FROM o.createdAt)
    """)
    List<Object[]> findMonthlyStatsByYear(@Param("year") int year);

    /** Danh sách tất cả năm có đơn hàng */
    @Query("SELECT DISTINCT EXTRACT(YEAR FROM o.createdAt) FROM Order o ORDER BY 1 DESC")
    List<Integer> findDistinctYears();

    /** Thống kê theo trạng thái đơn hàng */
    @Query("""
        SELECT o.status AS status,
               COUNT(o.id) AS cnt,
               SUM(o.totalAmount) AS revenue
        FROM Order o
        WHERE (:year IS NULL OR EXTRACT(YEAR FROM o.createdAt) = :year)
        GROUP BY o.status
    """)
    List<Object[]> findOrderStatusStats(@Param("year") Integer year);
}

