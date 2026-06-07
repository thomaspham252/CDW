import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../../services/blogData';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import '../../styles/blog/Blog.css';

const BlogPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Filter posts based on search term and category
    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             post.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    // Get 3 recent posts for sidebar
    const recentPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

    return (
        <div className="blog-page">
            {/* Banner */}
            <div className="blog-banner">
                <h1>Góc Sáng Tạo & Chia Sẻ</h1>
                <p>Nơi TTH Shop gửi gắm những câu chuyện về thế giới handmade, những hướng dẫn tự làm đồ thủ công tỉ mỉ và ý tưởng quà tặng đong đầy tình cảm.</p>
            </div>

            <div className="blog-layout">
                {/* Left side: Posts List */}
                <div className="blog-main-content">
                    {/* Category Filter Bar */}
                    <div className="blog-categories-bar">
                        <button 
                            className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            Tất cả
                        </button>
                        <button 
                            className={`category-filter-btn ${selectedCategory === 'huong-dan' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('huong-dan')}
                        >
                            Hướng Dẫn Handmade
                        </button>
                        <button 
                            className={`category-filter-btn ${selectedCategory === 'y-tuong' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('y-tuong')}
                        >
                            Ý Tưởng Quà Tặng
                        </button>
                        <button 
                            className={`category-filter-btn ${selectedCategory === 'xu-huong' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('xu-huong')}
                        >
                            Xu Hướng Thiết Kế
                        </button>
                    </div>

                    {/* Blog posts grid */}
                    {filteredPosts.length > 0 ? (
                        <div className="blog-grid">
                            {filteredPosts.map(post => (
                                <article className="blog-card" key={post.id}>
                                    <div className="blog-card-image">
                                        <img src={post.imageUrl} alt={post.title} />
                                        <span className="blog-card-badge">{post.categoryName}</span>
                                    </div>
                                    <div className="blog-card-content">
                                        <div className="blog-card-meta">
                                            <span>
                                                <FontAwesomeIcon icon={icons.user} /> {post.author}
                                            </span>
                                            <span>
                                                <FontAwesomeIcon icon={icons.clock} /> {post.readTime}
                                            </span>
                                        </div>
                                        <h2 className="blog-card-title">
                                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                        </h2>
                                        <p className="blog-card-summary">{post.summary}</p>
                                        <Link to={`/blog/${post.slug}`} className="blog-card-link">
                                            Đọc chi tiết <FontAwesomeIcon icon={icons.chevronRight} />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="blog-no-results">
                            <h3>Không tìm thấy bài viết nào phù hợp</h3>
                            <p>Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc danh mục.</p>
                            <button 
                                className="category-filter-btn active"
                                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                            >
                                Đặt lại bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Right side: Sidebar */}
                <aside className="blog-sidebar">
                    {/* Widget Search */}
                    <div className="sidebar-widget">
                        <h3 className="sidebar-widget-title">Tìm Kiếm Bài Viết</h3>
                        <form onSubmit={handleSearchSubmit} className="sidebar-search-form">
                            <input 
                                type="text" 
                                placeholder="Nhập từ khóa cần tìm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="sidebar-search-btn">
                                <FontAwesomeIcon icon={icons.search} />
                            </button>
                        </form>
                    </div>

                    {/* Widget Categories List */}
                    <div className="sidebar-widget">
                        <h3 className="sidebar-widget-title">Danh Mục Bài Viết</h3>
                        <ul className="sidebar-categories-list">
                            <li>
                                <span className="sidebar-category-link" onClick={() => setSelectedCategory('all')}>
                                    <span>Tất cả bài viết</span>
                                    <span className="sidebar-category-count">{blogPosts.length}</span>
                                </span>
                            </li>
                            <li>
                                <span className="sidebar-category-link" onClick={() => setSelectedCategory('huong-dan')}>
                                    <span>Hướng Dẫn Handmade</span>
                                    <span className="sidebar-category-count">
                                        {blogPosts.filter(p => p.category === 'huong-dan').length}
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span className="sidebar-category-link" onClick={() => setSelectedCategory('y-tuong')}>
                                    <span>Ý Tưởng Quà Tặng</span>
                                    <span className="sidebar-category-count">
                                        {blogPosts.filter(p => p.category === 'y-tuong').length}
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span className="sidebar-category-link" onClick={() => setSelectedCategory('xu-huong')}>
                                    <span>Xu Hướng Thiết Kế</span>
                                    <span className="sidebar-category-count">
                                        {blogPosts.filter(p => p.category === 'xu-huong').length}
                                    </span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Widget Recent Posts */}
                    <div className="sidebar-widget">
                        <h3 className="sidebar-widget-title">Bài Viết Mới Nhất</h3>
                        <div className="sidebar-recent-posts">
                            {recentPosts.map(post => (
                                <div className="recent-post-item" key={post.id}>
                                    <div className="recent-post-thumb">
                                        <img src={post.imageUrl} alt={post.title} />
                                    </div>
                                    <div className="recent-post-info">
                                        <Link to={`/blog/${post.slug}`} className="recent-post-title">
                                            {post.title}
                                        </Link>
                                        <span className="recent-post-date">{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BlogPage;
