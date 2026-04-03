import { useState } from 'react';
import { TransactionsTable } from '../ui/transactions-table';
import { Button } from '../components/button';
import { Upload, Download, Filter } from 'lucide-react';
import { BatchTransferDialog } from '../components/batch-transfer/batch-transfer-dialog';
import { useTransactions } from '../contexts/transaction-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Input } from '../components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select';

export default function TransactionsPage() {
  const { transactions, createTransactions } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleBatchSubmit = async (newTransactions: any[]) => {
    await createTransactions(newTransactions);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.accountHolderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Transaction Date', 'Account Number', 'Account Holder Name', 'Amount', 'Status'],
      ...filteredTransactions.map((t) => [
        t.transactionDate,
        t.accountNumber,
        t.accountHolderName,
        t.amount.toString(),
        t.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-600 mt-1">
            View and manage all transaction records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            Export CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
            <Upload className="h-5 w-5" />
            Batch Transfer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or account number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Settled">Settled</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transactions ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={filteredTransactions} />
        </CardContent>
      </Card>

      {/* Batch Transfer Dialog */}
      <BatchTransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleBatchSubmit}
      />
    </div>
  );
}
