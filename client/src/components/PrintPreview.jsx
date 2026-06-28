import { useRef } from "react";
import { printStyles } from "./printStyles";
import "../styles/printPreview.css";

export default function PrintPreview({ order, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "", "width=400,height=600");
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
          <style>${printStyles}</style>
        </head>
        <body>
          ${printRef.current.outerHTML}
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
    }
  };

  const formatDateGeorgian = () => {
    const now = new Date();
    
    const georgianDays = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
    const georgianMonths = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
    
    const day = georgianDays[now.getDay()];
    const date = now.getDate();
    const month = georgianMonths[now.getMonth()];
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${day}, ${date} ${month} ${year} | ${hours}:${minutes}:${seconds}`;
  };

  const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderDateTime = formatDateGeorgian();

  return (
    <div className="print-overlay">
      <div className="print-modal">
        <div className="print-header">
          <h2>შეკვეთის წინასწარი ნახვა</h2>
          <button className="print-close" onClick={onClose}>✕</button>
        </div>

        <div className="print-preview-container">
          <div className="receipt" ref={printRef}>
            <div className="receipt-content">
              <div className="receipt-header">
                <h1>შეკვეთა</h1>
                <p className="receipt-time">{orderDateTime}</p>
              </div>

              <div className="receipt-items">
                <table>
                  <thead>
                    <tr>
                      <th className="item-name">პროდუქტი</th>
                      <th className="item-qty">რაოდ</th>
                      <th className="item-price">ფასი</th>
                      <th className="item-total">სულ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="item-name">{item.product}</td>
                        <td className="item-qty">{item.quantity}</td>
                        <td className="item-price">₾{item.price}</td>
                        <td className="item-total">₾{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-divider">─────────────────</div>

              <div className="receipt-total">
                <div className="total-row">
                  <span>სულ:</span>
                  <span className="total-amount">₾{totalPrice}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="print-actions">
          <button className="print-btn cancel" onClick={onClose}>გაუქმება</button>
          <button className="print-btn primary" onClick={handlePrint}>ბეჭდვა</button>
        </div>
      </div>
    </div>
  );
}
