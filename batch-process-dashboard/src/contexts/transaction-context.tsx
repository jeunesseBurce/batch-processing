import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Transaction } from '../types/transaction';
import { transactionApi, batchTransferApi, initializeMockData } from '../services/api';
import { toast } from 'sonner';

interface TransactionContextType {
  // State
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  statistics: {
    total: number;
    pending: number;
    settled: number;
    failed: number;
    totalAmount: number;
  };

  // Actions
  fetchTransactions: () => Promise<void>;
  createTransactions: (transactions: Transaction[]) => Promise<void>;
  updateTransactionStatus: (
    id: string,
    status: Transaction['status'],
    errorMessage?: string
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshStatistics: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    settled: 0,
    failed: 0,
    totalAmount: 0,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionApi.getTransactions();
      setTransactions(data);
      const stats = await transactionApi.getStatistics();
      setStatistics(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStatistics = useCallback(async () => {
    try {
      const stats = await transactionApi.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, []);

  // Initialize mock data and fetch transactions on mount
  useEffect(() => {
    const init = async () => {
      initializeMockData();
      await fetchTransactions();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTransactions = useCallback(
    async (newTransactions: Transaction[]) => {
      setLoading(true);
      setError(null);
      try {
        await transactionApi.createTransactions(newTransactions);
        await fetchTransactions();
        toast.success(`${newTransactions.length} transaction(s) added successfully`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create transactions';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  const updateTransactionStatus = useCallback(
    async (id: string, status: Transaction['status'], errorMessage?: string) => {
      setLoading(true);
      setError(null);
      try {
        await transactionApi.updateTransactionStatus(id, status, errorMessage);
        await fetchTransactions();
        toast.success('Transaction status updated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update transaction';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await transactionApi.deleteTransaction(id);
        await fetchTransactions();
        toast.success('Transaction deleted');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete transaction';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTransactions]
  );

  const value: TransactionContextType = {
    transactions,
    loading,
    error,
    statistics,
    fetchTransactions,
    createTransactions,
    updateTransactionStatus,
    deleteTransaction,
    refreshStatistics,
  };

  return (
    <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}