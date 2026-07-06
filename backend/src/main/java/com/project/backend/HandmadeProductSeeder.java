package com.project.backend;

import com.project.backend.entity.product.Category;
import com.project.backend.entity.product.Product;
import com.project.backend.entity.product.ProductImage;
import com.project.backend.entity.product.ProductVariant;
import com.project.backend.repository.product.CategoryRepository;
import com.project.backend.repository.product.ProductImageRepository;
import com.project.backend.repository.product.ProductRepository;
import com.project.backend.repository.product.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class HandmadeProductSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println(">>> STARTING HANDMADE PRODUCT DATABASE SEEDER... <<<");

        try {
            // Mark old products as inactive, keep handmade products active
            List<Product> existingProducts = productRepository.findAll();
            for (Product p : existingProducts) {
                if (p.getCategory() != null && 
                    (p.getCategory().getSlug().equals("trang-suc-handmade") ||
                     p.getCategory().getSlug().equals("trang-tri-nha-cua") ||
                     p.getCategory().getSlug().equals("thoi-trang-phu-kien") ||
                     p.getCategory().getSlug().equals("qua-tang-nghe-thuat"))) {
                    p.setIsActive(true);
                } else {
                    p.setIsActive(false);
                }
                productRepository.save(p);
            }
            System.out.println(">>> Deactivated old products and kept handmade products active successfully. <<<");
        } catch (Exception e) {
            System.err.println("Error deactivating old products: " + e.getMessage());
        }

        try {
            // Create Categories (wrapped in try-catch to handle constraint violations)
            Category catJewelry = getOrCreateCategory("Trang sức Handmade", "trang-suc-handmade", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600");
            Category catHome = getOrCreateCategory("Trang trí nhà cửa", "trang-tri-nha-cua", "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=600");
            Category catFashion = getOrCreateCategory("Thời trang & Phụ kiện", "thoi-trang-phu-kien", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600");
            Category catGifts = getOrCreateCategory("Quà tặng nghệ thuật", "qua-tang-nghe-thuat", "https://images.unsplash.com/photo-1619623868779-1bf4ef8c82eb?q=80&w=600");

            // Seed Products only if categories were created/found successfully
            seedProductsForCategory(catJewelry, catHome, catFashion, catGifts);
            
            System.out.println(">>> SEEDED HANDMADE PRODUCTS SUCCESSFULLY! <<<");
        } catch (Exception e) {
            System.err.println("Error seeding products: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void seedProductsForCategory(Category catJewelry, Category catHome, 
                                         Category catFashion, Category catGifts) {
        createProduct("Khuyên tai đất sét tự làm", "khuyen-tai-dat-set-tu-lam", 
                "Khuyên tai độc đáo được tạo hình thủ công từ đất sét polymer cao cấp, mang phong cách hiện đại và thời thượng.", 
                catJewelry,
                Arrays.asList("Đỏ", "Xanh dương", "Vàng"),
                Arrays.asList("Mặc định"),
                150000,
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600"
        );

        createProduct("Vòng tay chỉ đỏ đan dây", "vong-tay-chi-do-dan-day", 
                "Vòng tay handmade được đan tỉ mỉ từ chỉ đỏ may mắn kết hợp các hạt cườm bạc lấp lánh.", 
                catJewelry,
                Arrays.asList("Đỏ", "Đen"),
                Arrays.asList("Mặc định"),
                85000,
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600"
        );

        createProduct("Nhẫn bạc đính đá thô nghệ thuật", "nhan-bac-dinh-da-tho-nghe-thuat", 
                "Nhẫn bạc thủ công đính đá quý thô tự nhiên, độc nhất vô nhị cho những tín đồ yêu thích sự mộc mạc.", 
                catJewelry,
                Arrays.asList("Bạc"),
                Arrays.asList("16", "17", "18"),
                380000,
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600"
        );

        createProduct("Dây chuyền gỗ nhựa epoxy resin", "day-chuyen-go-nhua-epoxy-resin", 
                "Mặt dây chuyền kết hợp nghệ thuật giữa gỗ sồi tự nhiên và nhựa Epoxy resin tạo hiệu ứng phong cảnh kỳ diệu.", 
                catJewelry,
                Arrays.asList("Xanh dương", "Hổ phách"),
                Arrays.asList("Mặc định"),
                290000,
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600"
        );

        // Category 2: Trang trí nhà cửa
        createProduct("Nến thơm sáp đậu nành hoa khô", "nen-thom-sap-dau-nanh-hoa-kho", 
                "Nến thơm handmade sản xuất từ sáp đậu nành tự nhiên, trang trí bằng hoa khô và tinh dầu hoa oải hương dễ chịu.", 
                catHome,
                Arrays.asList("Lavender", "LemonSip"),
                Arrays.asList("Hũ nhỏ 150g", "Hũ lớn 300g"),
                195000,
                "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600"
        );

        createProduct("Thảm macrame treo tường nghệ thuật", "tham-macrame-treo-tuong-nghe-thuat", 
                "Thảm treo tường trang trí được đan bằng dây cotton tự nhiên theo phong cách Boho lãng mạn.", 
                catHome,
                Arrays.asList("Trắng kem", "Xám nhạt"),
                Arrays.asList("60x80cm", "80x100cm"),
                450000,
                "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=600"
        );

        createProduct("Chậu cây gốm nung vẽ tay", "chau-cay-gom-nung-ve-tay", 
                "Chậu đất nung được vẽ họa tiết trang trí thủ công bằng sơn acrylic bền màu, thích hợp để bàn làm việc.", 
                catHome,
                Arrays.asList("Họa tiết Boho", "Họa tiết hoa lá"),
                Arrays.asList("Nhỏ 10cm", "Lớn 15cm"),
                120000,
                "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600"
        );

        createProduct("Bình hoa thủy tinh khảm mosaic", "binh-hoa-thuy-tinh-kham-mosaic", 
                "Bình cắm hoa nghệ thuật được ghép từ hàng trăm mảnh thủy tinh màu lấp lánh phản chiếu ánh sáng rực rỡ.", 
                catHome,
                Arrays.asList("Đa sắc", "Xanh đại dương"),
                Arrays.asList("Mặc định"),
                320000,
                "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=600"
        );

        // Category 3: Thời trang & Phụ kiện
        createProduct("Túi cói đi biển đan tay mộc mạc", "tui-coi-di-bien-dan-tay-moc-mac", 
                "Túi cói cầm tay thời trang đan hoàn toàn từ sợi lục bình tự nhiên của vùng sông nước Việt Nam.", 
                catFashion,
                Arrays.asList("Cói tự nhiên", "Nâu đất"),
                Arrays.asList("Mặc định"),
                350000,
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600"
        );

        createProduct("Mũ len móc thủ công thu đông", "mu-len-moc-thu-cong-thu-dong", 
                "Mũ len đan bằng sợi len lông cừu mềm mại, giữ ấm cực tốt và có thiết kế vô cùng xinh xắn.", 
                catFashion,
                Arrays.asList("Vàng mustard", "Xám lông chuột", "Hồng nhạt"),
                Arrays.asList("Mặc định"),
                160000,
                "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=600"
        );

        createProduct("Khăn choàng cổ len đan thô", "khan-choang-co-len-dan-tho", 
                "Khăn len choàng cổ bản to ấm áp, được đan thủ công từ sợi len acrylic xốp mịn cao cấp không phai màu.", 
                catFashion,
                Arrays.asList("Trắng kem", "Xanh rêu"),
                Arrays.asList("Mặc định"),
                240000,
                "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600"
        );

        createProduct("Ví da bò sáp khâu tay", "vi-da-bo-sap-khau-tay", 
                "Ví tiền làm từ da bò sáp thật 100%, khâu tay tỉ mỉ bằng chỉ sáp siêu bền bỉ theo thời gian.", 
                catFashion,
                Arrays.asList("Nâu sáp", "Đen tuyền"),
                Arrays.asList("Mặc định"),
                490000,
                "https://images.unsplash.com/photo-1627124118303-624c89432f82?q=80&w=600"
        );

        // Category 4: Quà tặng nghệ thuật
        createProduct("Khung tranh thêu tay hoa cỏ", "khung-tranh-theu-tay-hoa-co", 
                "Tranh thêu tay thủ công tinh tế trên vải thô mộc, lồng khung thêu tre tự nhiên làm quà lưu niệm tuyệt vời.", 
                catGifts,
                Arrays.asList("Hương lavender", "Cúc họa mi"),
                Arrays.asList("ĐK 15cm", "ĐK 20cm"),
                220000,
                "https://images.unsplash.com/photo-1619623868779-1bf4ef8c82eb?q=80&w=600"
        );

        createProduct("Thìa gỗ xà cừ khắc tên thủ công", "thia-go-xa-cu-khac-ten-thu-cong", 
                "Bộ thìa muỗng nhà bếp đẽo tay từ gỗ xà cừ nguyên khối, phủ dầu olive bảo vệ an toàn cho sức khỏe.", 
                catGifts,
                Arrays.asList("Gỗ tự nhiên"),
                Arrays.asList("Cỡ nhỏ 12cm", "Cỡ vừa 18cm"),
                75000,
                "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=600"
        );

        createProduct("Móc khóa búp bê len Amigurumi", "moc-khoa-bup-be-len-amigurumi", 
                "Móc chìa khóa búp bê nhỏ xinh đan móc bằng tay tỉ mỉ từ sợi len cotton Việt Nam an toàn.", 
                catGifts,
                Arrays.asList("Xanh nhạt", "Hồng nhạt"),
                Arrays.asList("Mặc định"),
                65000,
                "https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?q=80&w=600"
        );
    }

    private Category getOrCreateCategory(String name, String slug, String imgUrl) {
        Optional<Category> existing = categoryRepository.findBySlug(slug);
        if (existing.isPresent()) {
            // Update existing category's info if needed
            Category cat = existing.get();
            cat.setName(name);
            cat.setImgURL(imgUrl);
            return categoryRepository.save(cat);
        } else {
            // Create new category
            Category cat = Category.builder()
                    .name(name)
                    .slug(slug)
                    .imgURL(imgUrl)
                    .build();
            return categoryRepository.save(cat);
        }
    }

    private void createProduct(String name, String slug, String desc, Category category,
                               List<String> colors, List<String> sizes, double priceValue, String mainImgUrl) {
        if (productRepository.existsBySlug(slug)) {
            // Already created, update its active status just in case
            productRepository.findBySlug(slug).ifPresent(p -> {
                if (!p.getIsActive()) {
                    p.setIsActive(true);
                    productRepository.save(p);
                }
            });
            return;
        }
        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .description(desc)
                .category(category)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepository.save(product);

        // Build variants combining colors and sizes
        for (String size : sizes) {
            for (String color : colors) {
                ProductVariant variant = ProductVariant.builder()
                        .product(savedProduct)
                        .price(BigDecimal.valueOf(priceValue))
                        .basePrice(BigDecimal.valueOf(priceValue * 1.2)) // Mặc định sale 20%
                        .size(size)
                        .color(color)
                        .stock(50) // seed với tồn kho 50
                        .build();

                ProductVariant savedVariant = productVariantRepository.save(variant);

                // Add main image for each variant
                ProductImage img = ProductImage.builder()
                        .productVariant(savedVariant)
                        .imgUrl(mainImgUrl)
                        .isMain(true)
                        .build();

                productImageRepository.save(img);
            }
        }
    }
}
