import type { ParsedTransaction } from '../../types/transaction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

interface ReviewRecordsStepProps {
  parsedRecords: ParsedTransaction[];
}

export function ReviewRecordsStep({ parsedRecords }: ReviewRecordsStepProps) {
  const getCellClassName = (
    field: string,
    errors: ParsedTransaction['errors']
  ) => {
    const hasError = errors.some((e) => e.field === field);
    return hasError ? 'bg-red-50' : '';
  };

  const getFieldErrors = (
    field: string,
    errors: ParsedTransaction['errors']
  ) => {
    return errors.filter((e) => e.field === field);
  };

  const renderCellContent = (
    value: string,
    field: string,
    errors: ParsedTransaction['errors']
  ) => {
    const fieldErrors = getFieldErrors(field, errors);

    if (fieldErrors.length > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <span className="text-red-700">{value || '(empty)'}</span>
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <ul className="text-xs space-y-1">
                {fieldErrors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return value;
  };

  const validRecordsCount = parsedRecords.filter((r) => r.isValid).length;
  const invalidRecordsCount = parsedRecords.length - validRecordsCount;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>
            <span className="font-medium">{validRecordsCount}</span> valid records
          </span>
        </div>
        {invalidRecordsCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>
              <span className="font-medium">{invalidRecordsCount}</span> invalid
              records
            </span>
          </div>
        )}
      </div>

      <div className="border rounded-lg max-h-[400px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Transaction Date</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Account Holder Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-16 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsedRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="text-gray-500">{index + 1}</TableCell>
                <TableCell className={getCellClassName('transactionDate', record.errors)}>
                  {renderCellContent(
                    record.transactionDate,
                    'transactionDate',
                    record.errors
                  )}
                </TableCell>
                <TableCell
                  className={`font-mono text-sm ${getCellClassName(
                    'accountNumber',
                    record.errors
                  )}`}
                >
                  {renderCellContent(
                    record.accountNumber,
                    'accountNumber',
                    record.errors
                  )}
                </TableCell>
                <TableCell
                  className={getCellClassName('accountHolderName', record.errors)}
                >
                  {renderCellContent(
                    record.accountHolderName,
                    'accountHolderName',
                    record.errors
                  )}
                </TableCell>
                <TableCell
                  className={`text-right font-mono ${getCellClassName(
                    'amount',
                    record.errors
                  )}`}
                >
                  {renderCellContent(record.amount, 'amount', record.errors)}
                </TableCell>
                <TableCell className="text-center">
                  {record.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
