// Utility to guarantee reliable, flawless printing across all browsers and iframes
import { DepartmentId, MadrasaProfile, Transaction } from '../types';
import { DEPARTMENTS, formatBengaliDate, formatTaka, toBengaliNumber } from './formatters';

export function generateReceiptSlipHtml(
  transaction: Transaction,
  profile: MadrasaProfile
): string {
  const isIncome = transaction.type === 'income';
  const dept = DEPARTMENTS[transaction.departmentId];
  const directorName = profile.director || 'হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার এম এ';

  const renderSingleSlipHtml = (copyTitle: string) => `
    <div class="receipt-card">
      <div class="receipt-header">
        <div class="header-top">
          <span class="badge-no">
            <strong>${isIncome ? 'মানি রসিদ নং:' : 'ব্যয় ভাউচার নং:'}</strong> ${transaction.receiptNo || transaction.voucherNo || 'N/A'}
          </span>
          <span class="badge-copy">${copyTitle}</span>
        </div>
        <h1 class="madrasa-title">${profile.name}</h1>
        <p class="madrasa-sub">${profile.address} • মোবাইল: ${profile.phone}</p>
        <div class="receipt-type-pill">
          ${isIncome ? 'অফিশিয়াল আদায় ও মানি রসিদ' : 'অফিশিয়াল ব্যয় ভাউচার স্লিপ'}
        </div>
      </div>

      <div class="receipt-body">
        <div class="info-row">
          <div><span class="label">তারিখ:</span> <span class="val">${formatBengaliDate(transaction.date)}</span></div>
          <div class="text-right"><span class="label">বিভাগ:</span> <span class="val">${dept?.name || transaction.departmentId}</span></div>
        </div>

        <div class="party-box">
          <div class="party-left">
            <span class="label">${isIncome ? 'টাকা প্রদানকারী / ছাত্র:' : 'টাকা গ্রহণকারী / ব্যক্তি:'}</span>
            <div class="party-name">${transaction.payerOrPayee || 'সাধারণ'}</div>
            ${transaction.contactNumber ? `<div class="party-phone">মোবাইল: ${transaction.contactNumber}</div>` : ''}
          </div>
          <div class="party-right">
            <span class="label">পরিশোধের মাধ্যম</span>
            <div class="val">${transaction.paymentMethod || 'নগদ (Cash)'}</div>
          </div>
        </div>

        <div class="desc-box">
          <div><span class="label">খাত:</span> <strong class="val">${transaction.category}</strong></div>
          ${transaction.description ? `<div class="sub-desc">বিবরণ: "${transaction.description}"</div>` : ''}
        </div>

        <div class="amount-banner">
          <div>
            <div class="amount-label">${isIncome ? 'মোট আদায়কৃত টাকা' : 'মোট পরিশোধিত টাকা'}</div>
            <div class="amount-sub">(ডিজিটাল হিসাব খতিয়ান ভেরিফাইড)</div>
          </div>
          <div class="amount-val">${formatTaka(transaction.amount)}</div>
        </div>

        <div class="signatures-row">
          <div class="sig-box">
            <div class="sig-line">এন্ট্রি: ${transaction.entryBy || 'admin'}</div>
          </div>
          <div class="sig-box text-center">
            <div class="sig-line">আদায়কারী / ক্যাশিয়ার</div>
          </div>
          <div class="sig-box text-right">
            <div class="sig-line">মুহতামিম / পরিচালক</div>
            <div class="director-name">${directorName}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${isIncome ? 'মানি রসিদ' : 'ব্যয় ভাউচার'} - ${transaction.receiptNo || transaction.voucherNo || ''}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 20px;
    }
    .print-actions {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-print {
      background: #059669;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    .btn-print:hover {
      background: #047857;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .receipt-card {
      border: 2px solid #1e293b;
      border-radius: 10px;
      padding: 16px;
      background: #ffffff;
      margin-bottom: 16px;
      position: relative;
    }
    .cut-line {
      text-align: center;
      margin: 14px 0;
      border-top: 2px dashed #94a3b8;
      position: relative;
    }
    .cut-line span {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      padding: 0 12px;
      font-size: 11px;
      color: #64748b;
      font-weight: bold;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .badge-no {
      font-size: 12px;
      font-family: monospace;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .badge-copy {
      font-size: 11px;
      font-weight: bold;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .madrasa-title {
      text-align: center;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .madrasa-sub {
      text-align: center;
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }
    .receipt-type-pill {
      display: table;
      margin: 6px auto 10px auto;
      background: #0f172a;
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 14px;
      border-radius: 9999px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .text-right {
      text-align: right;
    }
    .label {
      color: #64748b;
      font-size: 12px;
    }
    .val {
      font-weight: bold;
      color: #0f172a;
    }
    .party-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .party-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }
    .party-phone {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      margin-top: 2px;
    }
    .desc-box {
      font-size: 13px;
      margin-bottom: 8px;
      padding: 4px 0;
    }
    .sub-desc {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
      font-style: italic;
    }
    .amount-banner {
      background: #ecfdf5;
      border: 2px solid #059669;
      border-radius: 8px;
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 10px 0 14px 0;
    }
    .amount-label {
      font-size: 12px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
    }
    .amount-sub {
      font-size: 10px;
      color: #047857;
    }
    .amount-val {
      font-size: 20px;
      font-weight: 900;
      color: #065f46;
      font-family: monospace, system-ui;
    }
    .signatures-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 18px;
      font-size: 11px;
    }
    .sig-box {
      flex: 1;
    }
    .sig-line {
      border-top: 1px solid #475569;
      display: inline-block;
      padding-top: 3px;
      font-weight: bold;
      min-width: 120px;
    }
    .director-name {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .print-actions {
        display: none !important;
      }
      .receipt-container {
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .receipt-card {
        border-color: #000000 !important;
        page-break-inside: avoid;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">
      🖨️ প্রিন্ট করুন / PDF সেভ করুন
    </button>
  </div>
  <div class="receipt-container">
    ${renderSingleSlipHtml('গ্রাহক / দাতার কপি')}
    <div class="cut-line">
      <span>✂️ এখান থেকে কাটুন (Office Cut Margin)</span>
    </div>
    ${renderSingleSlipHtml('অফিস / ক্যাশ কপি')}
  </div>
</body>
</html>
  `;
}

/**
 * Generates standalone HTML for official A4 Audit Reports
 */
export function generateAuditReportHtml(
  reportTitle: string,
  reportDateStr: string,
  totalIncome: number,
  totalExpense: number,
  netBalance: number,
  deptBreakdown: Record<DepartmentId, { income: number; expense: number; balance: number }>,
  transactionsList: Transaction[],
  profile: MadrasaProfile
): string {
  const directorName = profile.director || 'হাফেজ মাওলানা মোঃ হাবিবুল্লাহ বাহার এম এ';

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - ${profile.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 24px;
    }
    .print-actions {
      max-width: 900px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
    }
    .btn-print {
      background: #059669;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
    }
    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .report-header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .sub {
      font-size: 12px;
      color: #475569;
      margin: 3px 0;
    }
    .report-badge {
      display: inline-block;
      margin-top: 8px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 16px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
    }
    .stat-boxes {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
      text-align: center;
    }
    .stat-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .stat-card.income { background: #ecfdf5; border-color: #a7f3d0; }
    .stat-card.expense { background: #fff1f2; border-color: #fecdd3; }
    .stat-card.balance { background: #eff6ff; border-color: #bfdbfe; }
    .stat-num {
      font-size: 20px;
      font-weight: 800;
      font-family: monospace;
      margin-top: 4px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      border-bottom: 1px solid #94a3b8;
      padding-bottom: 4px;
      margin-bottom: 8px;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: bold;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; }
    .signatures {
      display: flex;
      justify-content: space-between;
      padding-top: 48px;
      font-size: 12px;
      text-align: center;
    }
    .sig-block {
      border-top: 1px solid #475569;
      width: 180px;
      padding-top: 4px;
      font-weight: bold;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .print-actions { display: none; }
      .report-container { box-shadow: none; padding: 0; max-width: 100%; }
      @page { size: A4 portrait; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">🖨️ প্রিন্ট করুন / PDF সেভ করুন</button>
  </div>
  <div class="report-container">
    <div class="report-header">
      <h1 class="title">${profile.name}</h1>
      <p class="sub">${profile.address} • ফোন: ${profile.phone} • রেজিঃ ${profile.regNo}</p>
      <div class="report-badge">${reportTitle}</div>
      <p class="sub" style="margin-top: 4px;">রিপোর্ট তৈরির সময়: ${formatBengaliDate(reportDateStr)}</p>
    </div>

    <div class="stat-boxes">
      <div class="stat-card income">
        <div style="font-size: 11px; font-weight: bold; color: #065f46;">মোট জমা / প্রাপ্তি</div>
        <div class="stat-num" style="color: #065f46;">${formatTaka(totalIncome)}</div>
      </div>
      <div class="stat-card expense">
        <div style="font-size: 11px; font-weight: bold; color: #9f1239;">মোট খরচ / ব্যয়</div>
        <div class="stat-num" style="color: #9f1239;">${formatTaka(totalExpense)}</div>
      </div>
      <div class="stat-card balance">
        <div style="font-size: 11px; font-weight: bold; color: #1e40af;">নিট উদ্বৃত্ত (ব্যালেন্স)</div>
        <div class="stat-num" style="color: #1e40af;">${formatTaka(netBalance)}</div>
      </div>
    </div>

    <div class="section-title">১. বিভাগভিত্তিক সারসংক্ষেপ</div>
    <table>
      <thead>
        <tr>
          <th>ক্রমিক</th>
          <th>বিভাগের নাম</th>
          <th class="text-right">মোট জমা (৳)</th>
          <th class="text-right">মোট খরচ (৳)</th>
          <th class="text-right">বর্তমান ব্যালেন্স (৳)</th>
        </tr>
      </thead>
      <tbody>
        ${(Object.keys(DEPARTMENTS) as DepartmentId[]).map((k, idx) => {
          const d = DEPARTMENTS[k];
          const stat = deptBreakdown[k] || { income: 0, expense: 0, balance: 0 };
          return `
            <tr>
              <td class="text-center">${toBengaliNumber(idx + 1)}</td>
              <td><strong>${d.name}</strong></td>
              <td class="text-right font-mono">${formatTaka(stat.income)}</td>
              <td class="text-right font-mono">${formatTaka(stat.expense)}</td>
              <td class="text-right font-mono"><strong>${formatTaka(stat.balance)}</strong></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="section-title">২. বিস্তারিত লেনদেন বিবরণী (${toBengaliNumber(transactionsList.length)}টি রেকর্ড)</div>
    <table>
      <thead>
        <tr>
          <th>তারিখ</th>
          <th>রসিদ/ভাউচার</th>
          <th>বিভাগ</th>
          <th>খাত ও বিবরণ</th>
          <th>দাতা / গ্রহীতা</th>
          <th class="text-right">জমা (৳)</th>
          <th class="text-right">খরচ (৳)</th>
        </tr>
      </thead>
      <tbody>
        ${transactionsList.length === 0 ? `<tr><td colspan="7" class="text-center">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</td></tr>` : 
          transactionsList.map((t) => {
            const dept = DEPARTMENTS[t.departmentId];
            return `
              <tr>
                <td>${t.date}</td>
                <td class="font-mono">${t.receiptNo || t.voucherNo || '-'}</td>
                <td>${dept?.shortName || t.departmentId}</td>
                <td><strong>${t.category}</strong>${t.description ? `<br><small style="color:#64748b">${t.description}</small>` : ''}</td>
                <td>${t.payerOrPayee || '-'}</td>
                <td class="text-right font-mono">${t.type === 'income' ? formatTaka(t.amount) : '-'}</td>
                <td class="text-right font-mono">${t.type === 'expense' ? formatTaka(t.amount) : '-'}</td>
              </tr>
            `;
          }).join('')
        }
      </tbody>
      <tfoot>
        <tr style="background:#f1f5f9; font-weight:bold;">
          <td colspan="5" class="text-right">সর্বমোট:</td>
          <td class="text-right font-mono">${formatTaka(totalIncome)}</td>
          <td class="text-right font-mono">${formatTaka(totalExpense)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="signatures">
      <div>
        <div class="sig-block">হিসাবরক্ষক / নাজের</div>
      </div>
      <div>
        <div class="sig-block">নিরীক্ষক / অডিট অফিসার</div>
      </div>
      <div>
        <div class="sig-block">মুহতামিম / পরিচালক</div>
        <div style="font-size: 10px; color: #475569; margin-top: 2px;">${directorName}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Triggers printing of slip using an isolated iframe
 */
export function directPrintSlip(
  transaction: Transaction,
  profile: MadrasaProfile
) {
  const html = generateReceiptSlipHtml(transaction, profile);

  let printFrame = document.getElementById('madrasa-print-frame') as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'madrasa-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);
  }

  const doc = printFrame.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch {
        openSlipInNewWindow(transaction, profile);
      }
    }, 400);
  } else {
    openSlipInNewWindow(transaction, profile);
  }
}

/**
 * Opens receipt in a clean standalone browser tab/window
 */
export function openSlipInNewWindow(
  transaction: Transaction,
  profile: MadrasaProfile
) {
  const html = generateReceiptSlipHtml(transaction, profile);
  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  } else {
    alert('পপ-আপ ব্লক করা রয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
  }
}

/**
 * Opens official audit report in standalone printable window
 */
export function openReportInNewWindow(
  reportTitle: string,
  reportDateStr: string,
  totalIncome: number,
  totalExpense: number,
  netBalance: number,
  deptBreakdown: Record<DepartmentId, { income: number; expense: number; balance: number }>,
  transactionsList: Transaction[],
  profile: MadrasaProfile
) {
  const html = generateAuditReportHtml(
    reportTitle,
    reportDateStr,
    totalIncome,
    totalExpense,
    netBalance,
    deptBreakdown,
    transactionsList,
    profile
  );
  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  } else {
    alert('পপ-আপ ব্লক করা রয়েছে। দয়া করে ব্রাউজারের পপ-আপ অনুমোদন করুন।');
  }
}
