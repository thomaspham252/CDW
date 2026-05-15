import axiosInstance from './axiosInstance';

/**
 * Product Service - Xử lý tất cả API calls liên quan đến sản phẩm
 */

const productService = {
  /**
   * Lấy danh sách sản phẩm đang active (cho storefront)
   * @param {Object} params - { page, size, sort }
   * @returns {Promise} Page<ProductSummaryResponse>
   */
  getProducts: async (params = {}) => {
    const { page = 0, size = 12, sort = 'id,desc' } = params;
    const response = await axiosInstance.get('/api/products', {
      params: { page, size, sort }
    });
    return response.data;
  },

  /**
   * Lấy chi tiết sản phẩm theo slug
   * @param {string} slug - Product slug
   * @returns {Promise} ProductDetailResponse
   */
  getProductBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/products/${slug}`);
    return response.data;
  },

  /**
   * Tìm kiếm sản phẩm theo category
   * @param {number} categoryId - Category ID
   * @param {Object} params - { page, size, sort }
   * @returns {Promise} Page<ProductSummaryResponse>
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    const { page = 0, size = 12, sort = 'id,desc' } = params;
    const response = await axiosInstance.get('/api/products', {
      params: { categoryId, page, size, sort }
    });
    return response.data;
  },

  // ========== ADMIN APIs ==========

  /**
   * Lấy danh sách tất cả sản phẩm (bao gồm inactive) - Admin only
   * @param {Object} params - { page, size, sort }
   * @returns {Promise} Page<ProductSummaryResponse>
   */
  getAllProducts: async (params = {}) => {
    const { page = 0, size = 20, sort = 'id,desc' } = params;
    const response = await axiosInstance.get('/api/admin/products', {
      params: { page, size, sort }
    });
    return response.data;
  },

  /**
   * Lấy chi tiết sản phẩm theo ID - Admin only
   * @param {number} id - Product ID
   * @returns {Promise} ProductDetailResponse
   */
  getProductById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/products/${id}`);
    return response.data;
  },

  /**
   * Tạo sản phẩm mới - Admin only
   * @param {Object} productData - ProductCreateRequest
   * @returns {Promise} ProductDetailResponse
   */
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/api/admin/products', productData);
    return response.data;
  },

  /**
   * Cập nhật sản phẩm - Admin only
   * @param {number} id - Product ID
   * @param {Object} productData - ProductUpdateRequest
   * @returns {Promise} ProductDetailResponse
   */
  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(`/api/admin/products/${id}`, productData);
    return response.data;
  },

  /**
   * Bật/tắt trạng thái sản phẩm - Admin only
   * @param {number} id - Product ID
   * @param {boolean} isActive - true/false
   * @returns {Promise}
   */
  setProductActive: async (id, isActive) => {
    const response = await axiosInstance.patch(
      `/api/admin/products/${id}/active`,
      null,
      { params: { value: isActive } }
    );
    return response.data;
  },

  // ========== VARIANT APIs ==========

  /**
   * Thêm variant mới vào sản phẩm - Admin only
   * @param {number} productId - Product ID
   * @param {Object} variantData - VariantUpsertRequest
   * @returns {Promise} VariantResponse
   */
  addVariant: async (productId, variantData) => {
    const response = await axiosInstance.post(
      `/api/admin/products/${productId}/variants`,
      variantData
    );
    return response.data;
  },

  /**
   * Cập nhật variant - Admin only
   * @param {number} variantId - Variant ID
   * @param {Object} variantData - VariantUpsertRequest
   * @returns {Promise} VariantResponse
   */
  updateVariant: async (variantId, variantData) => {
    const response = await axiosInstance.put(
      `/api/admin/variants/${variantId}`,
      variantData
    );
    return response.data;
  },

  /**
   * Xóa variant - Admin only
   * @param {number} variantId - Variant ID
   * @returns {Promise}
   */
  deleteVariant: async (variantId) => {
    const response = await axiosInstance.delete(`/api/admin/variants/${variantId}`);
    return response.data;
  },

  // ========== IMAGE APIs ==========

  /**
   * Thêm ảnh vào variant - Admin only
   * @param {number} variantId - Variant ID
   * @param {Object} imageData - ImageUpsertRequest { image, isMain }
   * @returns {Promise} ImageResponse
   */
  addImage: async (variantId, imageData) => {
    const response = await axiosInstance.post(
      `/api/admin/variants/${variantId}/images`,
      imageData
    );
    return response.data;
  },

  /**
   * Đặt ảnh làm ảnh chính - Admin only
   * @param {number} imageId - Image ID
   * @returns {Promise} ImageResponse
   */
  setMainImage: async (imageId) => {
    const response = await axiosInstance.patch(`/api/admin/images/${imageId}/main`);
    return response.data;
  },

  /**
   * Xóa ảnh - Admin only
   * @param {number} imageId - Image ID
   * @returns {Promise}
   */
  deleteImage: async (imageId) => {
    const response = await axiosInstance.delete(`/api/admin/images/${imageId}`);
    return response.data;
  }
};

export default productService;
