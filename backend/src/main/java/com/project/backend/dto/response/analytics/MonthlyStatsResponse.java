package com.project.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatsResponse {
    private int year;
    private int month;
    private BigDecimal revenue;
    private long orders;
    private long cancelledOrders;
}
