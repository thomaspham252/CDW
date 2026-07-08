import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/axiosInstance';
import './AdminProductForm.css';

const AdminProductForm = ({ product, categories, onClose, onSuccess }) => {
    const isEdit = !!product;

    // Product basic info
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Variants array
    const [variants, setVariants] = useState([
        { 
            id: Date.now(), 
            size: '', 
            color: '', 
            stock: 0, 
            price: 0, 
            basePrice: 0, 
            imageUrl: '' 
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load product details if editing
    useEffect(() => {
        const loadProductDetails = async () => {
            if (isEdit && product) {
                try {
                    setLoading(true);
                    setError('');
                    const res = await api.get(`/api/admin/products/${product.id}`);
                    const fullProduct = res.data;
                    
                    setName(fullProduct.name || '');
                    setSlug(fullProduct.slug || '');
                    setDescription(fullProduct.description || '');
                    setCategoryId(fullProduct.categoryId || '');
                    setIsActive(fullProduct.isActive !== false);

                    if (fullProduct.variants && fullProduct.variants.length > 0) {
                        const loadedVariants = fullProduct.variants.map(v => {
                            const mainImage = v.images?.find(img => img.isMain) || v.images?.[0];
                            return {
                                id: v.id,
                                size: v.size || '',
                                color: v.color || '',
                                stock: v.stock || 0,
                                price: v.price || 0,
                                basePrice: v.basePrice || 0,
                                imageUrl: mainImage?.imgUrl || ''
                            };
                        });
                        setVariants(loadedVariants);
                    }
                } catch (err) {
                    console.error('Error loading product details:', err);
                    setError('Không thể tải chi tiết sản phẩm.');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (isEdit && product) {
            loadProductDetails();
        } else {
            // Reset for new product
            setName('');
            setSlug('');
            setDescription('');
            setCategoryId(categories.length > 0 ? categories[0].id : '');
            setIsActive(true);
            setVariants([
                { 
                    id: Date.now(), 
                    size: '', 
                    color: '', 
                    stock: 0, 
                    price: 0, 
                    basePrice: 0, 
                    imageUrl: '' 
                }
            ]);
        }
    }, [product, isEdit, categories]);

    // Generate slug from name
    const generateSlug = (str) => {
        str = str.toLowerCase();
        // Remove Vietnamese accents
        str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
        str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
        str = str.replace(/[ìíịỉĩ]/g, "i");
        str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
        str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
        str = str.replace(/[ỳýỵỷỹ]/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/[^a-z0-9\s-]/g, '');
        str = str.replace(/[\s-]+/g, '-');
        str = str.replace(/^-+|-+$/g, '');
        return str;
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        if (!isEdit) {
            setSlug(generateSlug(val));
        }
    };

    // Variant management
    const addVariant = () => {
        setVariants([
            ...variants,
            { 
                id: Date.now(), 
                size: '', 
                color: '', 
                stock: 0, 
                price: 0, 
                basePrice: 0, 
                imageUrl: '' 
            }
        ]);
    };

    const removeVariant = (id) => {
        if (variants.length <= 1) {
            setError('Phải có ít nhất 1 biến thể sản phẩm');
            return;
        }
        setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariant = (id, field, value) => {
        setVariants(variants.map(v => 
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    // Validation
    const validateForm = () => {
        if (!name || !slug || !categoryId) {
            setError('Vui lòng nhập đầy đủ các trường bắt buộc (Tên, Slug, Danh mục)');
            return false;
        }

        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(slug)) {
            setError('Slug chỉ được chứa chữ thường, số và dấu gạch ngang (không bắt đầu/kết thúc bằng gạch ngang)');
            return false;
        }

        if (variants.length === 0) {
            setError('Phải có ít nhất 1 biến thể sản phẩm');
            return false;
        }

        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.size) {
                setError(`Biến thể ${i + 1}: Vui lòng nhập kích thước/size`);
                return false;
            }
            if (v.price < 0) {
                setError(`Biến thể ${i + 1}: Giá bán không được âm`);
                return false;
            }
            if (v.basePrice < 0) {
                setError(`Biến thể ${i + 1}: Giá gốc không được âm`);
                return false;
            }
            if (v.basePrice > 0 && v.basePrice < v.price) {
                setError(`Biến thể ${i + 1}: Giá gốc phải lớn hơn hoặc bằng giá bán`);
                return false;
            }
            if (v.stock < 0) {
                setError(`Biến thể ${i + 1}: Tồn kho không được âm`);
                return false;
            }
            if (!v.imageUrl) {
                setError(`Biến thể ${i + 1}: Vui lòng cung cấp link ảnh sản phẩm`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            if (isEdit) {
                // Update product basic info
                const productPayload = {
                    name,
                    slug,
                    description,
                    categoryId: parseInt(categoryId),
                    isActive
                };
                await api.put(`/api/admin/products/${product.id}`, productPayload);

                // Update each variant
                for (const v of variants) {
                    const variantPayload = {
                        price: parseFloat(v.price),
                        basePrice: parseFloat(v.basePrice) || parseFloat(v.price),
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock) || 0,
                        image: {
                            image: v.imageUrl,
                            isMain: true
                        }
                    };

                    if (typeof v.id === 'number' && v.id > 1000000) {
                        // New variant (temporary ID)
                        await api.post(`/api/admin/products/${product.id}/variants`, variantPayload);
                    } else {
                        // Existing variant
                        await api.put(`/api/admin/variants/${v.id}`, variantPayload);
                    }
                }
            } else {
                // Create new product with variants
                const variantsPayload = variants.map(v => ({
                    price: parseFloat(v.price),
                    basePrice: parseFloat(v.basePrice) || parseFloat(v.price),
                    size: v.size,
                    color: v.color,
                    stock: parseInt(v.stock) || 0,
                    image: {
                        image: v.imageUrl,
                        isMain: true
                    }
                }));

                const payload = {
                    name,
                    slug,
                    description,
                    categoryId: parseInt(categoryId),
                    isActive,
                    variants: variantsPayload
                };

                await api.post('/api/admin/products', payload);
            }

            onSuccess();
        } catch (err) {
            console.error('Error saving product:', err);
            const backendMsg = err.response?.data?.message;
            const errorDetails = err.response?.data?.error || err.message;
            setError(backendMsg || `Lỗi: ${errorDetails}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-card">
                <div className="modal-header">
                    <h2>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                    <button className="btn-close-modal" onClick={onClose} disabled={loading}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {error && <div className="alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Section 1: Product Information */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Thông tin sản phẩm</h3>
                            <p className="section-subtitle">Bảng products</p>
                        </div>

                        <div className="form-group">
                            <label>Tên sản phẩm</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={handleNameChange} 
                                placeholder="Túi vải thiêu tay hoa cúc" 
                                required 
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Slug</label>
                                <input 
                                    type="text" 
                                    value={slug} 
                                    onChange={(e) => setSlug(e.target.value)} 
                                    placeholder="tui-vai-thieu-tay-hoa-cuc" 
                                    required 
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Danh mục</label>
                                <select 
                                    value={categoryId} 
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mô tả</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder="Mô tả chi tiết sản phẩm..." 
                                rows="4"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={isActive} 
                                    onChange={(e) => setIsActive(e.target.checked)} 
                                    disabled={loading}
                                />
                                <span>Đang bán (is_active)</span>
                            </label>
                        </div>
                    </div>

                    {/* Section 2: Product Variants */}
                    <div className="form-section variant-section">
                        <div className="section-header">
                            <div>
                                <h3>Biến thể sản phẩm</h3>
                                <p className="section-subtitle">
                                    Bảng product_variants — mỗi biến thể có ảnh riêng (product_images)
                                </p>
                            </div>
                            <button 
                                type="button" 
                                className="btn-add-variant" 
                                onClick={addVariant}
                                disabled={loading}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Thêm biến thể
                            </button>
                        </div>

                        {variants.map((variant, index) => (
                            <div key={variant.id} className="variant-card">
                                <div className="variant-header">
                                    <span className="variant-label">Biến thể {index + 1}</span>
                                    {variants.length > 1 && (
                                        <button 
                                            type="button" 
                                            className="btn-remove-variant"
                                            onClick={() => removeVariant(variant.id)}
                                            disabled={loading}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Kích thước (size)</label>
                                        <input 
                                            type="text" 
                                            value={variant.size}
                                            onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                                            placeholder="M / 30x20cm"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Màu sắc (color)</label>
                                        <input 
                                            type="text" 
                                            value={variant.color}
                                            onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                                            placeholder="Be"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tồn kho (stock)</label>
                                        <input 
                                            type="number" 
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                            min="0"
                                            placeholder="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Giá gốc (base_price)</label>
                                        <input 
                                            type="number" 
                                            value={variant.basePrice}
                                            onChange={(e) => updateVariant(variant.id, 'basePrice', e.target.value)}
                                            min="0"
                                            placeholder="150000"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giá bán (price)</label>
                                        <input 
                                            type="number" 
                                            value={variant.price}
                                            onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                            min="0"
                                            placeholder="129000"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ảnh chính (img_url)</label>
                                        <input 
                                            type="url" 
                                            value={variant.imageUrl}
                                            onChange={(e) => updateVariant(variant.id, 'imageUrl', e.target.value)}
                                            placeholder="dán link ảnh hoặc tải lên"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {variant.imageUrl && (
                                    <div className="image-preview">
                                        <img 
                                            src={variant.imageUrl} 
                                            alt={`Preview ${index + 1}`} 
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
