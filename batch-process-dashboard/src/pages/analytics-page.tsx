import { useTransactions } from '../contexts/transaction-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const { transactions, statistics } = useTransactions();

  // Monthly aggregation
  const getMonthlyData = () => {
    const monthMap: Record<string, { settled: number; failed: number; amount: number }> = {};

    transactions.forEach((t) => {
      const month = t.transactionDate.substring(0, 7); // YYYY-MM
      if (!monthMap[month]) {
        monthMap[month] = { settled: 0, failed: 0, amount: 0 };
      }
      if (t.status === 'Settled') {
        monthMap[month].settled += 1;
        monthMap[month].amount += t.amount;
      } else if (t.status === 'Failed') {
        monthMap[month].failed += 1;
      }
    });

    return Object.entries(monthMap)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        settled: data.settled,
        failed: data.failed,
        amount: data.amount,
      }))
      .slice(-6);
  };

  // Account holder analysis
  const getTopAccountHolders = () => {
    const holderMap: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.status === 'Settled') {
        holderMap[t.accountHolderName] = (holderMap[t.accountHolderName] || 0) + t.amount;
      }
    });

    return Object.entries(holderMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  // Amount distribution
  const getAmountDistribution = () => {
    const ranges = [
      { name: '$0-500', min: 0, max: 500, count: 0 },
      { name: '$501-1000', min: 501, max: 1000, count: 0 },
      { name: '$1001-2000', min: 1001, max: 2000, count: 0 },
      { name: '$2001-5000', min: 2001, max: 5000, count: 0 },
      { name: '$5000+', min: 5001, max: Infinity, count: 0 },
    ];

    transactions.forEach((t) => {
      const range = ranges.find((r) => t.amount >= r.min && t.amount <= r.max);
      if (range) range.count++;
    });

    return ranges;
  };

  const monthlyData = getMonthlyData();
  const topHolders = getTopAccountHolders();
  const amountDistribution = getAmountDistribution();

  const avgTransactionAmount =
    statistics.total > 0 ? statistics.totalAmount / statistics.total : 0;

  const successRate =
    statistics.total > 0 ? (statistics.settled / statistics.total) * 100 : 0;

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Detailed insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgTransactionAmount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {statistics.settled} of {statistics.total} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.total > 0
                ? ((statistics.failed / statistics.total) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {statistics.failed} failed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pending}</div>
            <p className="text-xs text-gray-600 mt-1">Pending transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Transaction Volume</CardTitle>
            <CardDescription>Settled transaction amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success vs Failed Transactions</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="settled" fill="#22c55e" name="Settled" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Account Holders</CardTitle>
            <CardDescription>By total transaction amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topHolders} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amount Distribution</CardTitle>
            <CardDescription>Transaction count by amount range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={amountDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {amountDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
