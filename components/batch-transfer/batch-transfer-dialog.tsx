import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../dialog';
import { Button } from '../button';
import { TransferDetailsStep } from './transfer-details-step';
import { ReviewRecordsStep } from './review-records-step';
import { SummaryStep } from './summary-step';
import type { ParsedTransaction, Transaction } from '../../types/transaction';
import { validateTransaction } from '../../utils/validation';
import { toast } from 'sonner';
import { useBatchTransfer } from '../../contexts/batch-transfer-context';

interface BatchTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transactions: Transaction[]) => void;
}

type Step = 1 | 2 | 3;

export function BatchTransferDialog({
  open,
  onOpenChange,
  onSubmit,
}: BatchTransferDialogProps) {
  const { approvers, fetchApprovers, submitBatchTransfer, loading: apiLoading } =
    useBatchTransfer();
  const [step, setStep] = useState<Step>(1);
  const [batchName, setBatchName] = useState('');
  const [approver, setApprover] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedTransaction[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch approvers when dialog opens
  useEffect(() => {
    if (open && approvers.length === 0) {
      fetchApprovers();
    }
  }, [open, approvers.length, fetchApprovers]);

  const resetDialog = () => {
    setStep(1);
    setBatchName('');
    setApprover('');
    setCsvFile(null);
    setParsedRecords([]);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1
      if (!batchName.trim()) {
        toast.error('Please enter a batch transfer name');
        return;
      }
      if (!approver) {
        toast.error('Please select an approver');
        return;
      }
      if (!csvFile) {
        toast.error('Please upload a CSV file');
        return;
      }

      // Parse CSV file
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed: ParsedTransaction[] = results.data.map((row: any) => {
            const errors = validateTransaction(row);
            return {
              transactionDate: row['Transaction Date'] || '',
              accountNumber: row['Account Number'] || '',
              accountHolderName: row['Account Holder Name'] || '',
              amount: row['Amount'] || '',
              errors,
              isValid: errors.length === 0,
            };
          });

          setParsedRecords(parsed);
          setStep(2);
        },
        error: (error) => {
          toast.error(`Failed to parse CSV: ${error.message}`);
        },
      });
    } else if (step === 2) {
      if (parsedRecords.length === 0) {
        toast.error('No records to process');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Convert parsed records to transactions
      const transactions: Transaction[] = parsedRecords.map((record, index) => {
        const id = `${Date.now()}-${index}`;

        if (record.isValid) {
          return {
            id,
            transactionDate: record.transactionDate,
            accountNumber: record.accountNumber,
            accountHolderName: record.accountHolderName,
            amount: parseFloat(record.amount),
            status: 'Pending' as const,
          };
        } else {
          // Mark invalid records as Failed
          const errorMessages = record.errors.map((e) => `${e.field}: ${e.message}`);
          return {
            id,
            transactionDate: record.transactionDate || 'Invalid',
            accountNumber: record.accountNumber || 'Invalid',
            accountHolderName: record.accountHolderName || 'Invalid',
            amount: parseFloat(record.amount) || 0,
            status: 'Failed' as const,
            errorMessage: errorMessages.join('; '),
          };
        }
      });

      // Submit batch transfer through API
      await submitBatchTransfer({
        batchName,
        approver,
        transactions,
      });

      // Update local state
      onSubmit(transactions);
      toast.success(`Batch transfer "${batchName}" created successfully!`);
      handleClose();
    } catch (error) {
      console.error('Failed to submit batch transfer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Transfer Details';
      case 2:
        return 'Review Records';
      case 3:
        return 'Summary';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Enter batch details and upload CSV file';
      case 2:
        return 'Review and validate transaction records';
      case 3:
        return 'Confirm batch transfer details';
      default:
        return '';
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return batchName.trim() && approver && csvFile;
    }
    if (step === 2) {
      return parsedRecords.length > 0;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-2 ${
                    s < 3 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s === step
                        ? 'bg-blue-600 text-white'
                        : s < step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-0.5 w-16 ${
                        s < step ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <TransferDetailsStep
            batchName={batchName}
            setBatchName={setBatchName}
            approver={approver}
            setApprover={setApprover}
            csvFile={csvFile}
            setCsvFile={setCsvFile}
            approvers={approvers}
            loading={apiLoading}
          />
        )}

        {step === 2 && <ReviewRecordsStep parsedRecords={parsedRecords} />}

        {step === 3 && (
          <SummaryStep
            batchName={batchName}
            approver={approver}
            parsedRecords={parsedRecords}
          />
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={submitting}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}