package com.project.backend.dto.response.payment;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BankTransferPaymentResponse {
    private Integer orderId;
    private BigDecimal amount;
    private String bankId;
    private String bankName;
    private String accountNo;
    private String accountName;
    private String displayAccountName;
    private String transferContent;
    private String qrImageUrl;
}
