import { RouterProvider } from 'react-router';
import { router } from './routes';
import { TransactionProvider } from './contexts/transaction-context';
import { BatchTransferProvider } from './contexts/batch-transfer-context';
import { Toaster } from './components/sonner';

export default function App() {
  return (
    <TransactionProvider>
      <BatchTransferProvider>
        <RouterProvider router={router} />
        <Toaster />
      </BatchTransferProvider>
    </TransactionProvider>
  );
}
