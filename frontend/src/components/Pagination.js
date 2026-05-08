import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button 
                className="pagination-btn"
                disabled={currentPage === 1} 
                onClick={() => onPageChange(currentPage - 1)}
            >
                &laquo;
            </button>
            {pages.map(page => (
                <button 
                    key={page} 
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}
            <button 
                className="pagination-btn"
                disabled={currentPage === totalPages} 
                onClick={() => onPageChange(currentPage + 1)}
            >
                &raquo;
            </button>
        </div>
    );
};

export default Pagination;
