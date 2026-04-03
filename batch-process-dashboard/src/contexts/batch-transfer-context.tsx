import React, { createContext, useContext, useState, useCallback } from 'react';
import { batchTransferApi } from '../services/api';
import { toast } from 'sonner';

interface BatchTransferContextType {
  approvers: string[];
  loading: boolean;
  fetchApprovers: () => Promise<void>;
  submitBatchTransfer: (data: {
    batchName: string;
    approver: string;
    transactions: any[];
  }) => Promise<{ success: boolean; batchId: string }>;
}

const BatchTransferContext = createContext<BatchTransferContextType | undefined>(
  undefined
);

export function BatchTransferProvider({ children }: { children: React.ReactNode }) {
  const [approvers, setApprovers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await batchTransferApi.getApprovers();
      setApprovers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch approvers';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitBatchTransfer = useCallback(
    async (data: { batchName: string; approver: string; transactions: any[] }) => {
      setLoading(true);
      try {
        const result = await batchTransferApi.submitBatchTransfer(data);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit batch transfer';
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value: BatchTransferContextType = {
    approvers,
    loading,
    fetchApprovers,
    submitBatchTransfer,
  };

  return (
    <BatchTransferContext.Provider value={value}>
      {children}
    </BatchTransferContext.Provider>
  );
}

export function useBatchTransfer() {
  const context = useContext(BatchTransferContext);
  if (context === undefined) {
    throw new Error('useBatchTransfer must be used within a BatchTransferProvider');
  }
  return context;
}
