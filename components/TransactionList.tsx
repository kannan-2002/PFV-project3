'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete transaction');

      setTransactions(transactions.filter((t) => t._id !== id));
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading transactions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold p-6 border-b">Recent Transactions</h2>
      <div className="divide-y">
        {transactions.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No transactions found</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction._id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{transaction.category}</Badge>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(transaction.amount).toFixed(2)}
                </span>
                <Button variant="ghost" size="icon" onClick={() => deleteTransaction(transaction._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}