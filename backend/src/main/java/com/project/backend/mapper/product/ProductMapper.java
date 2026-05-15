package com.project.backend.mapper.product;

import com.project.backend.dto.request.product.ImageUpsertRequest;
import com.project.backend.dto.request.product.ProductCreateRequest;
import com.project.backend.dto.request.product.VariantUpsertRequest;
import com.project.backend.dto.response.product.ImageResponse;
import com.project.backend.dto.response.product.ProductDetailResponse;
import com.project.backend.dto.response.product.ProductSummaryResponse;
import com.project.backend.dto.response.product.VariantResponse;
import com.project.backend.entity.product.Category;
import com.project.backend.entity.product.Product;
import com.project.backend.entity.product.ProductImage;
import com.project.backend.entity.product.ProductVariant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    /**
     * Chuyển đổi từ ProductCreateRequest (dữ liệu client gửi lên) sang entity Product
     * để lưu vào database.
     *
     * @param req      DTO chứa thông tin tạo sản phẩm (name, slug, description, isActive...)
     * @param category Entity Category đã được tìm từ DB theo categoryId trong req
     * @return         Entity Product sẵn sàng để persist
     */
    public Product toEntity(ProductCreateRequest req, Category category) {
        return Product.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .category(category)          // gán đối tượng Category thay vì chỉ ID
                .isActive(req.getIsActive())
                .build();
    }

    /**
     * Chuyển đổi Product entity sang ProductSummaryResponse – dùng ở danh sách sản phẩm
     * (hiển thị thông tin ngắn gọn: id, tên, slug, ảnh chính, giá, trạng thái).
     *
     * Logic lấy ảnh chính & giá:
     *  - Tìm variant có giá THẤP NHẤT (để hiển thị "Từ XXX đồng")
     *  - Lấy ảnh chính (is_main = true) của variant đó
     *  - Lấy cả price và basePrice để hiển thị giá gốc (nếu có)
     *
     * @param product Entity Product (cần đã fetch sẵn variants + images – tránh LazyInit)
     * @return        DTO tóm tắt sản phẩm
     */
    public ProductSummaryResponse toSummary(Product product) {
        String mainUrl = null;
        BigDecimal price = null;
        BigDecimal basePrice = null;

        // Tìm variant có giá thấp nhất
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            ProductVariant cheapestVariant = product.getVariants().stream()
                    .min(Comparator.comparing(ProductVariant::getPrice))
                    .orElse(null);

            if (cheapestVariant != null) {
                price = cheapestVariant.getPrice();
                basePrice = cheapestVariant.getBasePrice();

                // Tìm ảnh chính của variant này
                if (cheapestVariant.getImages() != null) {
                    mainUrl = cheapestVariant.getImages().stream()
                            .filter(img -> Boolean.TRUE.equals(img.getIsMain()))
                            .map(ProductImage::getImgUrl)
                            .findFirst()
                            .orElse(null);
                }
            }
        }

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .mainUrl(mainUrl)       // URL ảnh chính (null nếu chưa có ảnh)
                .price(price)           // Giá thấp nhất
                .basePrice(basePrice)   // Giá gốc (để hiển thị giảm giá)
                .isActive(product.getIsActive())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .build();
    }

    /**
     * Chuyển đổi Product entity sang ProductDetailResponse – dùng ở trang chi tiết sản phẩm.
     * Trả về đầy đủ thông tin bao gồm tất cả variants và images.
     *
     * @param product Entity Product
     * @return        DTO chi tiết sản phẩm
     */
    public ProductDetailResponse toDetail(Product product) {
        ProductDetailResponse response = new ProductDetailResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setIsActive(product.getIsActive());

        // Lấy categoryId và categoryName
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }

        // Map tất cả variants
        if (product.getVariants() != null) {
            List<VariantResponse> variantResponses = product.getVariants().stream()
                    .map(this::toVariantResponse)
                    .collect(Collectors.toList());
            response.setVariants(variantResponses);
        }

        return response;
    }

    /**
     * Chuyển đổi ProductVariant entity sang VariantResponse.
     * Bao gồm tất cả images của variant.
     *
     * @param variant Entity ProductVariant
     * @return        DTO variant với danh sách images
     */
    public VariantResponse toVariantResponse(ProductVariant variant) {
        VariantResponse response = new VariantResponse();
        response.setId(variant.getId());
        response.setPrice(variant.getPrice());
        response.setBasePrice(variant.getBasePrice());
        response.setSize(variant.getSize());

        // Map tất cả images
        if (variant.getImages() != null) {
            List<ImageResponse> imageResponses = variant.getImages().stream()
                    .map(this::toImageResponse)
                    .collect(Collectors.toList());
            response.setImages(imageResponses);
        }

        return response;
    }

    /**
     * Chuyển đổi ProductImage entity sang ImageResponse.
     *
     * @param image Entity ProductImage
     * @return      DTO image
     */
    public ImageResponse toImageResponse(ProductImage image) {
        ImageResponse response = new ImageResponse();
        response.setId(image.getId());
        response.setImgUrl(image.getImgUrl());
        response.setIsMain(image.getIsMain());
        return response;
    }

    /**
     * Chuyển đổi VariantUpsertRequest (tạo/cập nhật biến thể) sang entity ProductVariant.
     * Chưa gán product ở đây – product sẽ được gán ở tầng Service sau khi có entity Product.
     *
     * @param req DTO chứa price, basePrice, size của biến thể
     * @return    Entity ProductVariant chưa có product (cần set thêm ở Service)
     */
    public ProductVariant toVariant(VariantUpsertRequest req) {
        return ProductVariant.builder()
                .price(BigDecimal.valueOf(req.getPrice()))           // chuyển double → BigDecimal
                .basePrice(BigDecimal.valueOf(req.getBasePrice()))   // giá gốc (trước khuyến mãi)
                .size(req.getSize())
                // product sẽ được set ở Service: variant.setProduct(savedProduct)
                .build();
    }

    /**
     * Chuyển đổi ImageUpsertRequest (tạo/cập nhật ảnh) sang entity ProductImage.
     * Chưa gán productVariant ở đây – sẽ được gán ở tầng Service.
     *
     * @param req DTO chứa URL ảnh và cờ is_main
     * @return    Entity ProductImage chưa có variant (cần set thêm ở Service)
     */
    public ProductImage toImage(ImageUpsertRequest req) {
        return ProductImage.builder()
                .imgUrl(req.getImage())   // URL ảnh (có thể là đường dẫn hoặc base64)
                .isMain(req.getIsMain())  // true = ảnh chính, false = ảnh phụ
                // productVariant sẽ được set ở Service: image.setProductVariant(savedVariant)
                .build();
    }
}
