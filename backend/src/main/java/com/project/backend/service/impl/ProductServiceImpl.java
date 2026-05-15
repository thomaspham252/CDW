package com.project.backend.service.impl;

import com.project.backend.dto.request.product.ImageUpsertRequest;
import com.project.backend.dto.request.product.ProductCreateRequest;
import com.project.backend.dto.request.product.ProductUpdateRequest;
import com.project.backend.dto.request.product.VariantUpsertRequest;
import com.project.backend.dto.response.product.ImageResponse;
import com.project.backend.dto.response.product.ProductDetailResponse;
import com.project.backend.dto.response.product.ProductSummaryResponse;
import com.project.backend.dto.response.product.VariantResponse;
import com.project.backend.entity.product.Category;
import com.project.backend.entity.product.Product;
import com.project.backend.entity.product.ProductImage;
import com.project.backend.entity.product.ProductVariant;
import com.project.backend.exception.BadRequestException;
import com.project.backend.exception.NotFoundException;
import com.project.backend.mapper.product.ProductMapper;
import com.project.backend.repository.product.CategoryRepository;
import com.project.backend.repository.product.ProductImageRepository;
import com.project.backend.repository.product.ProductRepository;
import com.project.backend.repository.product.ProductVariantRepository;
import com.project.backend.service.product.ProductService;
import com.project.backend.service.product.ProductValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository       productRepo;
    private final ProductVariantRepository variantRepo;
    private final ProductImageRepository   imageRepo;
    private final CategoryRepository       categoryRepo;
    private final ProductMapper            mapper;
    private final ProductValidator         validator;

    // =========================================================================
    // Product CRUD
    // =========================================================================

    /**
     * Tạo sản phẩm mới.
     * - Kiểm tra slug chưa tồn tại.
     * - Lookup category từ DB.
     * - Lưu Product, sau đó lưu Variant (và Image nếu có) kèm theo.
     */
    @Override
    @Transactional
    public ProductDetailResponse createProduct(ProductCreateRequest req) {
        // Rule 1: slug phải duy nhất
        validator.requireSlugUnique(req.getSlug(), productRepo);

        // Lookup category
        Category category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy category id=" + req.getCategoryId()));

        // Lưu Product
        Product product = mapper.toEntity(req, category);
        product = productRepo.save(product);

        // Lưu Variant đầu tiên kèm price validation (nếu có trong request)
        if (req.getVariant() != null) {
            saveVariantWithImage(product, req.getVariant());
        }

        return mapper.toDetail(product);
    }

    /**
     * Cập nhật thông tin cơ bản sản phẩm (name, slug, description, category, isActive).
     * Không chạm vào variants/images.
     */
    @Override
    @Transactional
    public ProductDetailResponse updateProduct(Integer id, ProductUpdateRequest req) {
        Product product = findProductById(id);

        // Rule 1: slug duy nhất khi đổi sang slug khác
        validator.requireSlugUniqueForUpdate(req.getSlug(), product.getSlug(), productRepo);

        // Lookup category mới
        Category category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy category id=" + req.getCategoryId()));

        // Cập nhật các field
        product.setName(req.getName());
        product.setSlug(req.getSlug());
        product.setDescription(req.getDescription());
        product.setCategory(category);
        product.setIsActive(req.getIsActive());

        product = productRepo.save(product);
        return mapper.toDetail(product);
    }

    /**
     * Bật / tắt hiển thị sản phẩm (isActive = true | false).
     */
    @Override
    @Transactional
    public void setActive(Integer id, Boolean isActive) {
        Product product = findProductById(id);
        product.setIsActive(isActive);
        productRepo.save(product);
    }

    /**
     * Lấy chi tiết sản phẩm theo id (dùng cho admin panel).
     */
    @Override
    public ProductDetailResponse getById(Integer id) {
        Product product = findProductById(id);
        return mapper.toDetail(product);
    }

    /**
     * Lấy chi tiết sản phẩm theo slug (dùng cho storefront / SEO URL).
     */
    @Override
    public ProductDetailResponse getBySlug(String slug) {
        Product product = productRepo.findBySlug(slug)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy sản phẩm với slug='" + slug + "'"));
        return mapper.toDetail(product);
    }

    /**
     * Danh sách sản phẩm đang active (isActive = true), phân trang – dùng cho storefront.
     */
    @Override
    public Page<ProductSummaryResponse> listActive(Pageable pageable) {
        return productRepo.findAllByIsActive(true, pageable)
                .map(mapper::toSummary);
    }

    /**
     * Danh sách toàn bộ sản phẩm (kể cả inactive), phân trang – dùng cho admin.
     */
    @Override
    public Page<ProductSummaryResponse> listAdmin(Pageable pageable) {
        return productRepo.findAll(pageable)
                .map(mapper::toSummary);
    }

    // =========================================================================
    // Variant operations
    // =========================================================================

    /**
     * Thêm biến thể mới vào sản phẩm.
     * Nếu trong req có kèm image thì lưu luôn.
     */
    @Override
    @Transactional
    public VariantResponse addVariant(Integer productId, VariantUpsertRequest req) {
        Product product = findProductById(productId);
        ProductVariant variant = saveVariantWithImage(product, req);
        return mapper.toVariantResponse(variant);
    }

    /**
     * Cập nhật price, basePrice, size của biến thể.
     */
    @Override
    @Transactional
    public VariantResponse updateVariant(Integer variantId, VariantUpsertRequest req) {
        ProductVariant variant = findVariantById(variantId);

        // Rule 2 & 3: price >= 0, basePrice >= price
        validator.validatePrices(req.getPrice(), req.getBasePrice());

        variant.setPrice(BigDecimal.valueOf(req.getPrice()));
        variant.setBasePrice(BigDecimal.valueOf(req.getBasePrice()));
        variant.setSize(req.getSize());

        variant = variantRepo.save(variant);
        return mapper.toVariantResponse(variant);
    }

    /**
     * Xóa biến thể (cascade → tự xóa images liên quan nhờ CascadeType.ALL).
     * Không cho phép xóa variant cuối cùng của sản phẩm.
     */
    @Override
    @Transactional
    public void deleteVariant(Integer variantId) {
        ProductVariant variant = findVariantById(variantId);
        Product product = variant.getProduct();

        // Validation: không cho xóa variant cuối cùng
        if (product.getVariants() != null && product.getVariants().size() <= 1) {
            throw new BadRequestException(
                    "Không thể xóa variant cuối cùng của sản phẩm. " +
                    "Hãy xóa sản phẩm hoặc thêm variant khác trước khi xóa variant này.");
        }

        variantRepo.delete(variant);
    }

    // =========================================================================
    // Image operations
    // =========================================================================

    /**
     * Thêm ảnh vào biến thể.
     * Rule 4: nếu isMain = true mà variant đã có ảnh chính → ném exception (hard block).
     * Để thay ảnh chính, dùng {@link #setMainImage(Integer)} thay vì method này.
     */
    @Override
    @Transactional
    public ImageResponse addImage(Integer variantId, ImageUpsertRequest req) {
        ProductVariant variant = findVariantById(variantId);

        // Rule 4: không cho phép có 2 ảnh isMain=true trên cùng 1 variant
        if (Boolean.TRUE.equals(req.getIsMain())) {
            validator.requireNoMainImageExists(variant);
        }

        ProductImage image = mapper.toImage(req);
        image.setProductVariant(variant);
        image = imageRepo.save(image);

        return mapper.toImageResponse(image);
    }

    /**
     * Đặt ảnh này làm ảnh chính của variant:
     * 1. Reset tất cả ảnh trong cùng variant về is_main = false.
     * 2. Đặt ảnh được chọn lên is_main = true.
     */
    @Override
    @Transactional
    public ImageResponse setMainImage(Integer imageId) {
        ProductImage image = findImageById(imageId);

        // Reset ảnh chính cũ trong cùng variant
        resetMainImage(image.getProductVariant());

        // Đặt ảnh mới làm ảnh chính
        image.setIsMain(true);
        image = imageRepo.save(image);

        return mapper.toImageResponse(image);
    }

    /**
     * Xóa ảnh theo id.
     */
    @Override
    @Transactional
    public void deleteImage(Integer imageId) {
        ProductImage image = findImageById(imageId);
        imageRepo.delete(image);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    /** Tìm Product theo id → 404 nếu không tồn tại. */
    private Product findProductById(Integer id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm id=" + id));
    }

    /** Tìm ProductVariant theo id → 404 nếu không tồn tại. */
    private ProductVariant findVariantById(Integer id) {
        return variantRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy variant id=" + id));
    }

    /** Tìm ProductImage theo id → 404 nếu không tồn tại. */
    private ProductImage findImageById(Integer id) {
        return imageRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy image id=" + id));
    }

    /**
     * Lưu variant (và image đi kèm nếu có) gắn vào product.
     * Dùng chung cho createProduct() và addVariant().
     */
    private ProductVariant saveVariantWithImage(Product product, VariantUpsertRequest req) {
        // Rule 2 & 3: kiểm tra price trước khi persist
        validator.validatePrices(req.getPrice(), req.getBasePrice());

        ProductVariant variant = mapper.toVariant(req);
        variant.setProduct(product);
        variant = variantRepo.save(variant);

        // Lưu ảnh đính kèm nếu có (isMain tự nhiên = false trừ khi req chỉ định)
        if (req.getImage() != null) {
            ProductImage image = mapper.toImage(req.getImage());
            image.setProductVariant(variant);
            imageRepo.save(image);
        }

        return variant;
    }

    /**
     * Reset toàn bộ ảnh của variant về is_main = false.
     * Gọi trước khi đặt ảnh chính mới để đảm bảo chỉ có 1 ảnh chính mỗi variant.
     */
    private void resetMainImage(ProductVariant variant) {
        if (variant.getImages() == null) return;
        for (ProductImage img : variant.getImages()) {
            if (Boolean.TRUE.equals(img.getIsMain())) {
                img.setIsMain(false);
                imageRepo.save(img);
            }
        }
    }
}
