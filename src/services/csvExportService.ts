import { Platform, Share, Alert } from 'react-native';
import type { Transaction } from '../types/transaction';

/**
 * Generate CSV string from array of transactions
 */
export const generateTransactionsCSV = (transactions: Transaction[]): string => {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Note', 'Goal ID'];
  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.type}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.note || '').replace(/"/g, '""')}"`,
    `"${t.goalId || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

/**
 * Download or Share CSV file
 */
export const exportTransactionsToCSV = async (transactions: Transaction[]): Promise<void> => {
  if (transactions.length === 0) {
    Alert.alert('Export Empty', 'There are no transactions to export.');
    return;
  }

  const csvContent = generateTransactionsCSV(transactions);
  const fileName = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;

  if (Platform.OS === 'web') {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('[csvExportService] Web export error:', err);
      Alert.alert('Export Failed', 'Could not generate CSV file on web.');
    }
  } else {
    try {
      // Native fallback share
      await Share.share({
        title: 'Transactions Export',
        message: csvContent,
      });
    } catch (err: any) {
      console.error('[csvExportService] Native export error:', err);
      Alert.alert('Export Error', 'Failed to share CSV data.');
    }
  }
};
