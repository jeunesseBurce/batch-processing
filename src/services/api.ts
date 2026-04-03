import type { Transaction } from '../types/transaction';

// API configuration
const API_BASE_URL = '/api';
const API_DELAY = 100; // Simulate network delay

// Simulate API responses for demo purposes
const simulateApiCall = <T,>(data: T, delay = API_DELAY): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// API Service
export const transactionApi = {
  // Fetch all transactions
  async getTransactions(): Promise<Transaction[]> {
    // In production, this would be: fetch(`${API_BASE_URL}/transactions`)
    const mockData = localStorage.getItem('transactions');
    const transactions = mockData ? JSON.parse(mockData) : [];
    return simulateApiCall(transactions);
  },

  // Create new transactions (batch)
  async createTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    // In production: fetch(`${API_BASE_URL}/transactions/batch`, { method: 'POST', body: ... })
    const existingData = localStorage.getItem('transactions');
    const existing = existingData ? JSON.parse(existingData) : [];
    const updated = [...transactions, ...existing];
    localStorage.setItem('transactions', JSON.stringify(updated));
    return simulateApiCall(transactions);
  },

  // Update transaction status
  async updateTransactionStatus(
    id: string,
    status: Transaction['status'],
    errorMessage?: string
  ): Promise<Transaction> {
    // In production: fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'PATCH', ... })
    const data = localStorage.getItem('transactions');
    const transactions: Transaction[] = data ? JSON.parse(data) : [];
    const index = transactions.findIndex((t) => t.id === id);
    
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        status,
        ...(errorMessage && { errorMessage }),
      };
      localStorage.setItem('transactions', JSON.stringify(transactions));
      return simulateApiCall(transactions[index]);
    }
    
    throw new Error('Transaction not found');
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    // In production: fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' })
    const data = localStorage.getItem('transactions');
    const transactions: Transaction[] = data ? JSON.parse(data) : [];
    const filtered = transactions.filter((t) => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(filtered));
    return simulateApiCall(undefined);
  },

  // Get transaction statistics
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    settled: number;
    failed: number;
    totalAmount: number;
  }> {
    const transactions = await this.getTransactions();
    return simulateApiCall({
      total: transactions.length,
      pending: transactions.filter((t) => t.status === 'Pending').length,
      settled: transactions.filter((t) => t.status === 'Settled').length,
      failed: transactions.filter((t) => t.status === 'Failed').length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    });
  },
};

// Batch Transfer API
export const batchTransferApi = {
  // Get list of approvers
  async getApprovers(): Promise<string[]> {
    // In production: fetch(`${API_BASE_URL}/approvers`)
    const approvers = [
      'Sarah Johnson',
      'Michael Chen',
      'Emily Rodriguez',
      'David Kim',
      'Jessica Taylor',
      'Robert Martinez',
      'Amanda Lee',
      'Christopher Brown',
    ];
    return simulateApiCall(approvers);
  },

  // Submit batch transfer
  async submitBatchTransfer(data: {
    batchName: string;
    approver: string;
    transactions: Transaction[];
  }): Promise<{ success: boolean; batchId: string }> {
    // In production: fetch(`${API_BASE_URL}/batch-transfers`, { method: 'POST', ... })
    const batchId = `batch-${Date.now()}`;
    
    // Store batch metadata
    const batches = JSON.parse(localStorage.getItem('batches') || '[]');
    batches.unshift({
      id: batchId,
      name: data.batchName,
      approver: data.approver,
      createdAt: new Date().toISOString(),
      transactionCount: data.transactions.length,
      status: 'submitted',
    });
    localStorage.setItem('batches', JSON.stringify(batches));
    
    return simulateApiCall({ success: true, batchId });
  },
};

// Initialize with mock data if localStorage is empty
export const initializeMockData = () => {
  if (!localStorage.getItem('transactions')) {
    const initialTransactions: Transaction[] = [
      {
        id: '1',
        transactionDate: '2025-02-15',
        accountNumber: '000-123456789-01',
        accountHolderName: 'Alice Williams',
        amount: 1250.0,
        status: 'Settled',
      },
      {
        id: '2',
        transactionDate: '2025-02-16',
        accountNumber: '000-987654321-02',
        accountHolderName: 'Bob Anderson',
        amount: 750.5,
        status: 'Pending',
      },
      {
        id: '3',
        transactionDate: '2025-02-17',
        accountNumber: '000-555666777-03',
        accountHolderName: 'Carol Martinez',
        amount: 2100.75,
        status: 'Settled',
      },
      {
        id: '4',
        transactionDate: '2025-02-18',
        accountNumber: '000-111222333-04',
        accountHolderName: 'Daniel Thompson',
        amount: 500.0,
        status: 'Failed',
        errorMessage: 'Insufficient funds in source account',
      },
      {
        id: '5',
        transactionDate: '2025-02-19',
        accountNumber: '000-444555666-05',
        accountHolderName: 'Emma Garcia',
        amount: 3500.25,
        status: 'Pending',
      },
    ];
    localStorage.setItem('transactions', JSON.stringify(initialTransactions));
  }
};