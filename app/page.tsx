import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import ExpensesChart from '@/components/ExpensesChart';
import CategoryChart from '@/components/CategoryChart';
import DashboardCards from '@/components/DashboardCards';
import BudgetForm from '@/components/BudgetForm';
import BudgetComparison from '@/components/BudgetComparison';
import SpendingInsights from '@/components/SpendingInsights';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Personal Finance Tracker</h1>
      
      <div className="mb-8">
        <DashboardCards />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-8">
          <TransactionForm />
          <BudgetForm />
          <TransactionList />
        </div>
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <BudgetComparison />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <ExpensesChart />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <CategoryChart />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <SpendingInsights />
      </div>
    </div>
  );
}