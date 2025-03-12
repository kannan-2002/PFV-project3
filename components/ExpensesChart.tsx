'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

interface Transaction {
  _id: string;
  amount: number;
  date: string;
}

export default function ExpensesChart() {
  const [data, setData] = useState<{ name: string; expenses: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const transactions: Transaction[] = await response.json();
      
      // Get last 6 months
      const months = eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date(),
      });

      const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthExpenses = transactions
          .filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= monthStart && transactionDate <= monthEnd && t.amount < 0;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          name: format(month, 'MMM yyyy'),
          expenses: monthExpenses,
        };
      });

      setData(monthlyData);
    } catch (error) {
      console.error('Failed to fetch transactions for chart:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading chart...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Monthly Expenses</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Expenses']}
            />
            <Bar dataKey="expenses" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}