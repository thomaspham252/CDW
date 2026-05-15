package com.project.backend.dto.response.product;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ImageResponse {
    private Integer id;
    private String imgUrl;
    private Boolean isMain;
}
