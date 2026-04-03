export type TransactionStatus = 'Pending' | 'Settled' | 'Failed';

export interface Transaction {
  id: string;
  transactionDate: string;
  accountNumber: string;
  accountHolderName: string;
  amount: number;
  status: TransactionStatus;
  errorMessage?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ParsedTransaction {
  transactionDate: string;
  accountNumber: string;
  accountHolderName: string;
  amount: string;
  errors: ValidationError[];
  isValid: boolean;
}

export interface BatchTransferData {
  batchName: string;
  approver: string;
  csvFile: File | null;
  parsedRecords: ParsedTransaction[];
}
