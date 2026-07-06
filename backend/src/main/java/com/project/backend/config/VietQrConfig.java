package com.project.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class VietQrConfig {
    @Value("${vietqr.bank-id:mbbank}")
    private String bankId;

    @Value("${vietqr.bank-name:MB Bank}")
    private String bankName;

    @Value("${vietqr.account-no:25022004042000}")
    private String accountNo;

    @Value("${vietqr.account-name:PHAM VAN LINH}")
    private String accountName;

    @Value("${vietqr.display-account-name:CUA HANG HANDMADE CDW}")
    private String displayAccountName;

    @Value("${vietqr.template:compact2}")
    private String template;
}
