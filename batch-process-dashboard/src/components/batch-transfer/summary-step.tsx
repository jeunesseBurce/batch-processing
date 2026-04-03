import type { ParsedTransaction } from '../../types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Separator } from '../separator';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';

interface SummaryStepProps {
  batchName: string;
  approver: string;
  parsedRecords: ParsedTransaction[];
}

export function SummaryStep({ batchName, approver, parsedRecords }: SummaryStepProps) {
  // Calculate statistics from valid records only
  const validRecords = parsedRecords.filter((r) => r.isValid);
  const totalAmount = validRecords.reduce(
    (sum, record) => sum + parseFloat(record.amount),
    0
  );
  const numberOfPayments = validRecords.length;
  const averagePayment = numberOfPayments > 0 ? totalAmount / numberOfPayments : 0;

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Batch Transfer Name</h3>
          <p className="mt-1 text-lg font-medium">{batchName}</p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Approver</h3>
          <p className="mt-1 text-lg font-medium">{approver}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Summary Statistics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Sum of all valid transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Number of Payments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numberOfPayments}</div>
              <p className="text-xs text-muted-foreground">
                {parsedRecords.length - numberOfPayments > 0 && (
                  <span className="text-red-600">
                    {parsedRecords.length - numberOfPayments} invalid excluded
                  </span>
                )}
                {parsedRecords.length - numberOfPayments === 0 && (
                  <span>All records valid</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averagePayment.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per valid transaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {parsedRecords.length - numberOfPayments > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> {parsedRecords.length - numberOfPayments} invalid record(s) 
            will be marked as "Failed" and will not be processed.
          </p>
        </div>
      )}
    </div>
  );
}
