export const FREE_SHIPPING_THRESHOLD = 500000;
export const SHIPPING_FEE = 35000;

export const BANK_TRANSFER_CONFIG = {
  bankId: "mbbank",
  bankName: "Ngân hàng MB Bank",
  accountNo: "25022004042000",
  accountName: "PHAM VAN LINH",
  displayAccountName: "CỬA HÀNG HANDMADE CDW",
  template: "compact2",
};

export const getShippingFee = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

export const getTransferContent = (orderId) => `CDW ${orderId}`;

export const getVietQrImageUrl = (order) => {
  const amount = Math.round(Number(order?.totalAmount || 0));
  const addInfo = encodeURIComponent(getTransferContent(order?.id));
  const accountName = encodeURIComponent(BANK_TRANSFER_CONFIG.accountName);

  return `https://img.vietqr.io/image/${BANK_TRANSFER_CONFIG.bankId}-${BANK_TRANSFER_CONFIG.accountNo}-${BANK_TRANSFER_CONFIG.template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
};
