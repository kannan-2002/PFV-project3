'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface Transaction {
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  category: string;
  amount: number;
}

export default function SpendingInsights() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [transactionsRes, budgetsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/budgets')
      ]);

      if (!transactionsRes.ok || !budgetsRes.ok) throw new Error('Failed to fetch data');

      const transactionsData = await transactionsRes.json();
      const budgetsData = await budgetsRes.json();

      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading insights...</div>;
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlySpending = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.amount < 0 &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    })
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const insights = [];

  // Categories over budget
  const overBudgetCategories = budgets
    .filter(budget => {
      const spent = monthlySpending[budget.category] || 0;
      return spent > budget.amount;
    })
    .map(budget => ({
      category: budget.category,
      amount: monthlySpending[budget.category] - budget.amount,
    }));

  if (overBudgetCategories.length > 0) {
    insights.push({
      title: 'Over Budget Alert',
      description: `You're over budget in ${overBudgetCategories.length} ${
        overBudgetCategories.length === 1 ? 'category' : 'categories'
      }`,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      details: overBudgetCategories.map(cat => 
        `${cat.category}: $${cat.amount.toFixed(2)} over budget`
      ).join(', '),
      type: 'warning'
    });
  }

  // Highest spending category
  const highestSpending = Object.entries(monthlySpending)
    .sort(([, a], [, b]) => b - a)[0];

  if (highestSpending) {
    insights.push({
      title: 'Highest Spending',
      description: `Your highest spending category is ${highestSpending[0]}`,
      icon: <TrendingUp className="h-4 w-4 text-yellow-500" />,
      details: `Total spent: $${highestSpending[1].toFixed(2)}`,
      type: 'info'
    });
  }

  // Categories under budget
  const underBudgetCategories = budgets
    .filter(budget => {
      const spent = monthlySpending[budget.category] || 0;
      return spent < budget.amount * 0.5 && spent > 0;
    })
    .map(budget => ({
      category: budget.category,
      saved: budget.amount - (monthlySpending[budget.category] || 0),
    }));

  if (underBudgetCategories.length > 0) {
    insights.push({
      title: 'Good Progress',
      description: `You're well under budget in ${underBudgetCategories.length} ${
        underBudgetCategories.length === 1 ? 'category' : 'categories'
      }`,
      icon: <TrendingDown className="h-4 w-4 text-green-500" />,
      details: underBudgetCategories.map(cat => 
        `${cat.category}: $${cat.saved.toFixed(2)} remaining`
      ).join(', '),
      type: 'success'
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Spending Insights</h2>
      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`border-l-4 ${
            insight.type === 'warning' ? 'border-l-red-500' :
            insight.type === 'success' ? 'border-l-green-500' :
            'border-l-yellow-500'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {insight.icon}
                {insight.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{insight.description}</p>
              <p className="text-sm mt-1 text-gray-700">{insight.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}