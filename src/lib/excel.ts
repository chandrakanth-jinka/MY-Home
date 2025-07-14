"use client";

import * as XLSX from 'xlsx';

/**
 * Detects if the app is running in a WebView
 */
const isWebView = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
        userAgent.includes('wv') || // Android WebView
        userAgent.includes('median') || // Median app
        (userAgent.includes('safari') && !userAgent.includes('chrome')) // iOS WebView
    );
};

/**
 * Detects if the app is running on Android
 */
const isAndroid = () => {
    return navigator.userAgent.toLowerCase().includes('android');
};

/**
 * Exports two sheets (Expenses, Milk) to Excel file with robust cross-platform download logic
 * @param expenses Array of expense objects
 * @param milk Array of milk objects
 * @param filename Name of the Excel file (without extension)
 */
export const exportToExcelMultiSheet = async (
  expenses: any[],
  milk: any[],
  filename: string
): Promise<boolean> => {
  try {
    // Define columns for each sheet
    const expenseColumns = ['Date', 'Item', 'Amount', 'Added By'];
    const milkColumns = [
      'Date',
      'Milkman',
      'Morning Qty (L)',
      'Evening Qty (L)',
      'Total Qty (L)',
      'Cost',
      'Added By',
      'Last Edited By'
    ];

    // Map data to ensure correct column order
    const expensesData = expenses.map(e => ({
      'Date': e.date,
      'Item': e.item,
      'Amount': e.amount,
      'Added By': e.addedBy
    }));

    const milkData = milk.map(m => ({
      'Date': m.date,
      'Milkman': m.milkman,
      'Morning Qty (L)': m.morningQty,
      'Evening Qty (L)': m.eveningQty,
      'Total Qty (L)': m.totalQty,
      'Cost': m.cost,
      'Added By': m.addedBy,
      'Last Edited By': m.lastEditedBy
    }));

    // Create worksheets
    const expensesSheet = XLSX.utils.json_to_sheet(expensesData, { header: expenseColumns });
    const milkSheet = XLSX.utils.json_to_sheet(milkData, { header: milkColumns });

    // Create workbook and append sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');
    XLSX.utils.book_append_sheet(workbook, milkSheet, 'Milk');

    // Write and download (robust cross-platform logic)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const arrayBuffer = new ArrayBuffer(excelBuffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < excelBuffer.length; i++) {
      view[i] = excelBuffer.charCodeAt(i) & 0xFF;
    }
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (isWebView()) {
      if (isAndroid()) {
        // Method 1: FileReader + base64 + anchor
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const link = document.createElement('a');
          link.href = base64;
          link.download = `${filename}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return true;
        } catch (error) {
          console.log('Method 1 failed, trying Method 2');
        }
        // Method 2: window.open with base64
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          window.open(base64, '_blank');
          return true;
        } catch (error) {
          console.log('Method 2 failed, trying Method 3');
        }
        // Method 3: iframe
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          if (iframe.contentWindow) {
            const link = iframe.contentWindow.document.createElement('a');
            link.href = base64;
            link.download = `${filename}.xlsx`;
            iframe.contentWindow.document.body.appendChild(link);
            link.click();
            document.body.removeChild(iframe);
            return true;
          }
        } catch (error) {
          console.log('Method 3 failed');
        }
      } else {
        // iOS WebView - standard method
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return true;
      }
    } else {
      // Regular browser - standard method
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    }
    console.error('All download methods failed');
    return false;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};
