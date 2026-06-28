export const printStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'DM Mono', monospace;
    padding: 15px;
    background: white;
  }
  .receipt {
    width: 100%;
    max-width: 800px;
    background: #ffffff;
    border: 2px solid rgba(60, 40, 10, 0.15);
    border-radius: 6px;
    padding: 25px;
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    color: #1c1917;
    line-height: 1.4;
    margin: 0 auto;
  }
  .receipt-content {
    text-align: center;
  }
  .receipt-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #1c1917;
  }
  .receipt-header h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #1c1917;
    font-family: 'Syne', sans-serif;
  }
  .receipt-time {
    margin: 0;
    font-size: 14px;
    color: #a8a29e;
  }
  .receipt-items {
    margin-bottom: 15px;
    text-align: left;
  }
  .receipt-items table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .receipt-items thead {
    border-bottom: 1.5px solid rgba(60, 40, 10, 0.2);
  }
  .receipt-items th {
    padding: 6px 3px;
    text-align: left;
    font-weight: 600;
    color: #1c1917;
  }
  .receipt-items th.item-qty {
    text-align: center;
  }
  .receipt-items th.item-price {
    text-align: right;
  }
  .receipt-items th.item-total {
    text-align: right;
  }
  .receipt-items td {
    padding: 4px 3px;
    border-bottom: 0.5px solid rgba(60, 40, 10, 0.1);
  }
  .item-name {
    text-align: left;
    max-width: 300px;
    word-break: break-word;
    flex: 1;
  }
  .item-qty {
    text-align: center;
    width: 50px;
  }
  .item-price {
    text-align: right;
    width: 60px;
  }
  .item-total {
    text-align: right;
    width: 60px;
    font-weight: 600;
  }
  .receipt-divider {
    text-align: center;
    margin: 12px 0;
    color: #a8a29e;
    font-size: 14px;
    letter-spacing: 2px;
  }
  .receipt-total {
    margin-bottom: 15px;
    padding: 12px;
    background: rgba(28, 25, 23, 0.02);
    border-radius: 4px;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: 700;
    font-size: 18px;
  }
  .total-amount {
    font-size: 22px;
    color: #b45309;
  }
  .receipt-footer {
    text-align: center;
    font-size: 14px;
    color: #a8a29e;
    margin-top: 12px;
  }
  .receipt-footer p {
    margin: 0;
  }
  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    body {
      margin: 0;
      padding: 15px;
    }
    .receipt {
      width: 100%;
      border: none;
      box-shadow: none;
      page-break-after: avoid;
      margin: 0;
      padding: 25px;
    }
  }
`;
