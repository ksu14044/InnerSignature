export const getPaymentMethodLabel = (method) => {
  const labels = {
    'CASH': '현금',
    'CARD': '개인카드',
    'COMPANY_CARD': '회사카드',
    'CHECK': '수표',
    'CREDIT_CARD': '신용카드',
    'DEBIT_CARD': '체크카드'
  };
  return labels[method] || method;
};

