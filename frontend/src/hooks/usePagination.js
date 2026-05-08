import { useState, useMemo } from 'react';

export const usePagination = (items, itemsPerPage, scrollToTop = true) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / (itemsPerPage || 1)) || 1;

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return {
        currentPage,
        totalPages,
        paginatedItems,
        handlePageChange
    };
};
