const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`

export function printReceipt(sale) {
  const now = new Date().toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const itemRows = sale.items.map(i => {
    const name = i.name.length > 22 ? i.name.slice(0, 22) + '…' : i.name
    const subtotal = kes(i.price * i.qty)
    return `
      <tr>
        <td style="padding:2px 0 0;font-size:12px;" colspan="2">${name} x${i.qty}</td>
      </tr>
      <tr>
        <td style="padding:0 0 5px 8px;font-size:11px;color:#666;">${kes(i.price)} each</td>
        <td style="padding:0 0 5px 0;font-size:12px;text-align:right;font-weight:600;">${subtotal}</td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt ${sale.receiptNo}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 80mm;
      margin: 0 auto;
      padding: 10px 12px 24px;
      background: #fff;
      color: #111;
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed #ccc;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .shop-name {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #993556;
    }
    .tagline { font-size: 10px; color: #555; margin-top: 2px; }
    .contact { font-size: 10px; color: #333; margin-top: 3px; }
    .meta { font-size: 10px; color: #444; margin-bottom: 8px; line-height: 1.7; }
    .meta span { display: block; }
    .divider { border: none; border-top: 1px dashed #ccc; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    .totals td { font-size: 13px; padding: 2px 0; }
    .grand td {
      font-size: 15px;
      font-weight: 900;
      border-top: 1px dashed #ccc;
      padding-top: 6px;
      margin-top: 4px;
    }
    .payment-badge {
      display: inline-block;
      background: #FBEAF0;
      color: #993556;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-top: 6px;
    }
    .mpesa-ref { font-size: 10px; color: #555; margin-top: 3px; }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #555;
      margin-top: 14px;
      border-top: 1px dashed #ccc;
      padding-top: 10px;
    }
    .thank { font-size: 13px; font-weight: 700; color: #993556; }
  </style>
</head>
<body>

  <div class="header">
    <div class="shop-name">BIGGIE CHILL SPOT</div>
    <div class="tagline">Wines &amp; Spirits — Nairobi, Kenya</div>
    <div class="contact">Tel: +254 700 000 000</div>
  </div>

  <div class="meta">
    <span><b>Receipt #:</b> ${sale.receiptNo}</span>
    <span><b>Date:</b> ${now}</span>
    <span><b>Cashier:</b> ${sale.cashier}</span>
  </div>

  <hr class="divider"/>

  <table>${itemRows}</table>

  <hr class="divider"/>

  <table class="totals">
    <tr>
      <td>Subtotal (${sale.items.reduce((s, i) => s + i.qty, 0)} items)</td>
      <td style="text-align:right;">${kes(sale.total)}</td>
    </tr>
    <tr>
      <td>Tax (0%)</td>
      <td style="text-align:right;">KES 0</td>
    </tr>
  </table>

  <table class="grand">
    <tr>
      <td><b>TOTAL</b></td>
      <td style="text-align:right;"><b>${kes(sale.total)}</b></td>
    </tr>
  </table>

  <div>
    <span class="payment-badge">Paid via ${sale.payment}</span>
    ${sale.mpesaRef ? `<div class="mpesa-ref">M-Pesa Ref: <b>${sale.mpesaRef}</b></div>` : ''}
  </div>

  <div class="footer">
    <div class="thank">Thank you! Come again 🍾</div>
    <div style="margin-top:4px;">Enjoy responsibly · 18+</div>
    <div style="margin-top:2px;">biggiechillspot.co.ke</div>
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=400,height=620')
  if (!win) { alert('Please allow popups to print receipts.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}
