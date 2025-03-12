'use client';

import { useEffect, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Budget {
  category: string;
  amount: number;
  month: string;
}

interface Transaction {
  amount: number;
  category: string;
  date: string;
}

export default function BudgetComparison() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch(`/api/budgets?month=${selectedMonth}`),
        fetch('/api/transactions')
      ]);

      if (!budgetsRes.ok || !transactionsRes.ok) throw new Error('Failed to fetch data');

      const budgetsData = await budgetsRes.json();
      const transactionsData = await transactionsRes.json();

      setBudgets(budgetsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const monthStart = startOfMonth(new Date(selectedMonth));

  const categorySpending = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.amount < 0 &&
        transactionDate >= monthStart &&
        transactionDate <= new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      );
    })
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const chartData = budgets.map(budget => ({
    category: budget.category,
    Budget: budget.amount,
    Spent: categorySpending[budget.category] || 0,
    Remaining: Math.max(0, budget.amount - (categorySpending[budget.category] || 0)),
  }));

  if (isLoading) {
    return <div className="text-center">Loading budget comparison...</div>;
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Budget vs Actual</h2>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-40"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${remainingBudget.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="Budget" fill="#94a3b8" />
            <Bar dataKey="Spent" fill="#ef4444" />
            <Bar dataKey="Remaining" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}