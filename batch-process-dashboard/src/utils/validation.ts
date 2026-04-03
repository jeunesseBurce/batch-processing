import type { ValidationError } from '../types/transaction';

// Validate transaction date (ISO format YYYY-MM-DD)
export function validateTransactionDate(dateString: string): ValidationError | null {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!isoDateRegex.test(dateString)) {
    return {
      field: 'transactionDate',
      message: 'Must be in ISO format (YYYY-MM-DD)'
    };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      field: 'transactionDate',
      message: 'Invalid date'
    };
  }
  
  // Check if the date components match (to catch invalid dates like 2025-02-30)
  const [year, month, day] = dateString.split('-').map(Number);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return {
      field: 'transactionDate',
      message: 'Invalid date'
    };
  }
  
  return null;
}

// Validate account number (format: 000-000000000-00)
export function validateAccountNumber(accountNumber: string): ValidationError | null {
  const accountNumberRegex = /^\d{3}-\d{9}-\d{2}$/;
  
  if (!accountNumberRegex.test(accountNumber)) {
    return {
      field: 'accountNumber',
      message: 'Must match pattern 000-000000000-00'
    };
  }
  
  return null;
}

// Validate account holder name (must not be empty)
export function validateAccountHolderName(name: string): ValidationError | null {
  if (!name || name.trim() === '') {
    return {
      field: 'accountHolderName',
      message: 'Must not be empty'
    };
  }
  
  return null;
}

// Validate amount (must be a positive decimal number)
export function validateAmount(amountString: string): ValidationError | null {
  const amount = parseFloat(amountString);
  
  if (isNaN(amount)) {
    return {
      field: 'amount',
      message: 'Must be a valid number'
    };
  }
  
  if (amount <= 0) {
    return {
      field: 'amount',
      message: 'Must be positive'
    };
  }
  
  return null;
}

// Validate entire transaction record
export function validateTransaction(record: {
  'Transaction Date': string;
  'Account Number': string;
  'Account Holder Name': string;
  'Amount': string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const dateError = validateTransactionDate(record['Transaction Date']);
  if (dateError) errors.push(dateError);
  
  const accountError = validateAccountNumber(record['Account Number']);
  if (accountError) errors.push(accountError);
  
  const nameError = validateAccountHolderName(record['Account Holder Name']);
  if (nameError) errors.push(nameError);
  
  const amountError = validateAmount(record['Amount']);
  if (amountError) errors.push(amountError);
  
  return errors;
}
