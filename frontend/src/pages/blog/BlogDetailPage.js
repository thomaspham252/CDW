import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../../services/blogData';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import '../../styles/blog/Blog.css';

const BlogDetailPage = () => {
    const { slug } = useParams();
    
    // Find matching post
    const post = blogPosts.find(p => p.slug === slug);

    // Scroll to top on render or slug change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!post) {
        return (
            <div className="blog-page text-center" style={{ padding: '80px 20px' }}>
                <h2>Rất tiếc, không tìm thấy bài viết này!</h2>
                <p style={{ margin: '15px 0 30px' }}>Bài viết bạn đang truy cập có thể đã bị xóa hoặc không tồn tại.</p>
                <Link to="/blog" className="category-filter-btn active" style={{ textDecoration: 'none' }}>
                    Quay lại Trang Tin Tức
                </Link>
            </div>
        );
    }

    // Get related posts (same category, excluding current post, max 2 items)
    const relatedPosts = blogPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 2);

    // If no related posts in same category, get any other posts
    const backupRelatedPosts = relatedPosts.length > 0 ? relatedPosts : 
        blogPosts.filter(p => p.id !== post.id).slice(0, 2);

    return (
        <div className="blog-detail-container">
            {/* Back to Blog List */}
            <Link to="/blog" className="blog-detail-back-btn">
                <FontAwesomeIcon icon={icons.chevronLeft} /> Quay lại Tin Tức
            </Link>

            {/* Post Header */}
            <header className="blog-detail-header">
                <span className="blog-detail-badge">{post.categoryName}</span>
                <h1 className="blog-detail-title">{post.title}</h1>
                <div className="blog-detail-meta">
                    <span>
                        <FontAwesomeIcon icon={icons.user} /> Đăng bởi: <strong>{post.author}</strong>
                    </span>
                    <span>
                        <FontAwesomeIcon icon={icons.clock} /> Thời gian đọc: {post.readTime}
                    </span>
                    <span>
                        <FontAwesomeIcon icon={icons.home} /> Ngày: {new Date(post.date).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </header>

            {/* Cover Image */}
            <div className="blog-detail-cover">
                <img src={post.imageUrl} alt={post.title} />
            </div>

            {/* Post Content */}
            <article className="blog-detail-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Related Posts */}
            <section className="related-posts-section">
                <h3>Bài Viết Liên Quan</h3>
                <div className="related-posts-grid">
                    {backupRelatedPosts.map(relPost => (
                        <div className="related-card" key={relPost.id}>
                            <div className="related-card-img">
                                <img src={relPost.imageUrl} alt={relPost.title} />
                            </div>
                            <div className="related-card-body">
                                <Link to={`/blog/${relPost.slug}`} className="related-card-title">
                                    {relPost.title}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BlogDetailPage;
