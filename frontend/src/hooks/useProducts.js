import { useState, useEffect } from "react";
import productService from "../services/productService";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({
          page: 0,
          size: 20,
          sort: "id,desc",
        });

        const mappedProducts = response.content.map((p) => ({
          id: p.id,
          variantId: p.variantId,
          name: p.name,
          slug: p.slug,
          image:
            p.mainUrl ||
            p.imgUrl ||
            p.img_url ||
            "https://placehold.co/300x300?text=No+Image",
          price: p.price ? parseFloat(p.price) : 0,
          originalPrice: p.basePrice ? parseFloat(p.basePrice) : null,
          category: p.categoryName || "Chưa phân loại",
          rating: 5,
          reviews: 0,
          stock: p.stock !== null && p.stock !== undefined ? p.stock : 0,
          defaultVariantId: p.defaultVariantId,
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, loading };
};
