package com.project.backend.dto.request.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderCreateRequest {
    @NotBlank(message = "Fullname cannot be empty")
    private String fullname;

    @NotBlank(message = "Phone cannot be empty")
    private String phone;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Address cannot be empty")
    private String address;

    private String ward;
    private String district;
    private String province;
    private Integer provinceId;
    private Integer districtId;
    private String wardCode;
    private String note;

    @NotBlank(message = "Payment method cannot be empty")
    private String paymentMethod;

    private String couponCode;

    @NotEmpty(message = "Cart cannot be empty")
    @Valid
    private List<OrderItemRequest> items;
}
