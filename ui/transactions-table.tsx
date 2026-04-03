import type { Transaction } from '../types/transaction';
import { Badge } from '../components/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { Button } from '../components/button';
import { AlertCircle, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTransactions } from '../contexts/transaction-context';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const { updateTransactionStatus, deleteTransaction } = useTransactions();

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Settled':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const handleStatusChange = async (id: string, status: Transaction['status']) => {
    await updateTransactionStatus(id, status);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction Date</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Account Holder Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No transactions yet. Use the Batch Transfer button to add transactions.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.transactionDate}</TableCell>
                <TableCell className="font-mono text-sm">
                  {transaction.accountNumber}
                </TableCell>
                <TableCell>{transaction.accountHolderName}</TableCell>
                <TableCell className="text-right font-mono">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {transaction.status === 'Failed' && transaction.errorMessage ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help w-fit">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{transaction.errorMessage}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(transaction.id, 'Pending')}
                        disabled={transaction.status === 'Pending'}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(transaction.id, 'Settled')}
                        disabled={transaction.status === 'Settled'}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Settled
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(transaction.id, 'Failed')}
                        disabled={transaction.status === 'Failed'}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark as Failed
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}