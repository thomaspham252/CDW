export const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const getPriceByType = (basePrice, selectedType, types) => {
    if (!selectedType || !types) return basePrice;
    // Logic giả định: các type khác nhau có thể cộng thêm tiền (ví dụ size L + 20k)
    // Ở đây ta có thể giả định một logic đơn giản hoặc trả về basePrice nếu data chưa có price riêng cho từng type
    return basePrice;
};
