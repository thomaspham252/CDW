import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import api from '../../services/axiosInstance';

const AdminProductForm = ({ product, categories, onClose, onSuccess }) => {
    const isEdit = !!product;

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Initial variant info (only used for Create product)
    const [price, setPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);
    const [size, setSize] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pre-fill if editing
    useEffect(() => {
        if (isEdit && product) {
            setName(product.name || '');
            setSlug(product.slug || '');
            setDescription(product.description || '');
            setCategoryId(product.categoryId || '');
            setIsActive(product.isActive !== false);
        } else {
            // Defaults for new product
            setName('');
            setSlug('');
            setDescription('');
            setCategoryId(categories.length > 0 ? categories[0].id : '');
            setIsActive(true);
            setPrice(0);
            setBasePrice(0);
            setSize('Mặc định');
            setImageUrl('');
        }
    }, [product, isEdit, categories]);

    // Simple Vietnamese slugifier
    const generateSlug = (str) => {
        str = str.toLowerCase();
        // Remove accents
        str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
        str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
        str = str.replace(/[ìíịỉĩ]/g, "i");
        str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
        str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
        str = str.replace(/[ỳýỵỷỹ]/g, "y");
        str = str.replace(/đ/g, "d");
        // Remove special chars and replace spaces with dashes
        str = str.replace(/[^a-z0-9\s-]/g, '');
        str = str.replace(/[\s-]+/g, '-');
        // Clean leading/trailing dashes
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name || !slug || !categoryId) {
            setError('Vui lòng nhập đầy đủ các trường bắt buộc.');
            setLoading(false);
            return;
        }

        // Validate slug regex (lowercase letters, numbers, and dashes)
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(slug)) {
            setError('Slug chỉ được chứa chữ thường, số và dấu gạch ngang (không bắt đầu/kết thúc bằng gạch ngang).');
            setLoading(false);
            return;
        }

        try {
            if (isEdit) {
                // Update basic info
                const payload = {
                    name,
                    slug,
                    description,
                    categoryId: parseInt(categoryId),
                    isActive
                };
                await api.put(`/api/admin/products/${product.id}`, payload);
            } else {
                // Create product with variant and image
                if (price < 0 || basePrice < 0) {
                    setError('Giá bán và giá gốc không được âm.');
                    setLoading(false);
                    return;
                }
                if (basePrice > 0 && basePrice < price) {
                    setError('Giá gốc phải lớn hơn hoặc bằng giá bán.');
                    setLoading(false);
                    return;
                }
                if (!imageUrl) {
                    setError('Vui lòng cung cấp link hình ảnh sản phẩm.');
                    setLoading(false);
                    return;
                }

                const payload = {
                    name,
                    slug,
                    description,
                    categoryId: parseInt(categoryId),
                    isActive,
                    variant: {
                        price: parseFloat(price),
                        basePrice: parseFloat(basePrice) || parseFloat(price),
                        size: size || 'Mặc định',
                        image: {
                            image: imageUrl,
                            isMain: true
                        }
                    }
                };
                await api.post('/api/admin/products', payload);
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm. Vui lòng kiểm tra lại dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-card">
                <div className="modal-header">
                    <h2>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                    <button className="btn-close-modal" onClick={onClose}>
                        <FontAwesomeIcon icon={icons.times} />
                    </button>
                </div>

                {error && <div className="admin-alert danger">{error}</div>}

                <form onSubmit={handleSubmit} className="modal-body-form">
                    <div className="form-sections-wrapper">
                        {/* Section 1: Basic Information */}
                        <div className="form-col-section">
                            <h3>Thông tin cơ bản</h3>
                            <div className="form-group">
                                <label>Tên sản phẩm *</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={handleNameChange} 
                                    placeholder="Ví dụ: Búp bê len handmade" 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Đường dẫn tĩnh (Slug) *</label>
                                <input 
                                    type="text" 
                                    value={slug} 
                                    onChange={(e) => setSlug(e.target.value)} 
                                    placeholder="bup-be-len-handmade" 
                                    required 
                                />
                            </div>

                            <div className="form-group-row col-2">
                                <div className="form-group">
                                    <label>Danh mục *</label>
                                    <select 
                                        value={categoryId} 
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group align-center-row">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={isActive} 
                                            onChange={(e) => setIsActive(e.target.checked)} 
                                        />
                                        Hiển thị trên Store
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mô tả chi tiết</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Mô tả chất liệu, quy trình làm thủ công của sản phẩm..." 
                                    rows="4"
                                />
                            </div>
                        </div>

                        {/* Section 2: Pricing & Media (Only for Create Product) */}
                        {!isEdit && (
                            <div className="form-col-section border-left">
                                <h3>Biến thể & Hình ảnh</h3>
                                
                                <div className="form-group-row col-2">
                                    <div className="form-group">
                                        <label>Giá bán (VNĐ) *</label>
                                        <input 
                                            type="number" 
                                            value={price} 
                                            onChange={(e) => setPrice(e.target.value)} 
                                            min="0"
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giá gốc (để gạch đi, VNĐ)</label>
                                        <input 
                                            type="number" 
                                            value={basePrice} 
                                            onChange={(e) => setBasePrice(e.target.value)} 
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phân loại / Size *</label>
                                    <input 
                                        type="text" 
                                        value={size} 
                                        onChange={(e) => setSize(e.target.value)} 
                                        placeholder="Ví dụ: Nhỏ / Lớn, Đỏ / Trắng" 
                                        required 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Đường dẫn ảnh sản phẩm (Link URL) *</label>
                                    <input 
                                        type="url" 
                                        value={imageUrl} 
                                        onChange={(e) => setImageUrl(e.target.value)} 
                                        placeholder="https://images.unsplash.com/..." 
                                        required 
                                    />
                                    {imageUrl && (
                                        <div className="image-preview-box">
                                            <img src={imageUrl} alt="Preview" onError={(e) => e.target.src = 'https://placehold.co/100x100?text=L%E1%BB%97i+Ảnh'} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
