'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [source, setSource] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [tempSource, setTempSource] = useState('');
  const router = useRouter();

  const fetchData = async (start: string, end: string, src: string) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (start) params.append('start_date', start);
      if (end) params.append('end_date', end);
      if (src) params.append('source', src);

      const res = await fetch(
        `http://localhost:8000/energy_data${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!res.ok) throw new Error('Failed to fetch data');

      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData('', '', '');
  }, [user]);

  const handleApplyFilters = () => {
    if (tempEndDate && tempStartDate && tempEndDate < tempStartDate) {
      setError('End date cannot be earlier than start date');
      return;
    }
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setSource(tempSource);
    fetchData(tempStartDate, tempEndDate, tempSource);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filterData = (data: any) => {
    let filteredData = data;
    
    if (startDate) {
      filteredData = filteredData.filter((item: any) => new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredData = filteredData.filter((item: any) => new Date(item.date) <= new Date(endDate));
    }
    if (source) {
      filteredData = filteredData.filter((item: any) => item.energy_source.toLowerCase() === source.toLowerCase());
    }
    
    return filteredData;
  };

  const calculateDashletValues = (filteredData: any) => {
    const energyGenerated = filteredData.reduce((acc: number, item: any) => acc + item.generation_mwh, 0);
    const energyConsumed = filteredData.reduce((acc: number, item: any) => acc + item.consumption_mwh, 0);
    const revenueGenerated = filteredData.reduce((acc: number, item: any) => acc + item.revenue, 0);
    const totalCost = filteredData.reduce((acc: number, item: any) => acc + (item.price_per_mwh), 0);

    return { energyGenerated, energyConsumed, revenueGenerated, totalCost };
  };

  const ConsumptionGenerationChart = ({ data }: { data: any }) => {
    const filteredData = filterData(data);
    const isSameDate = startDate && endDate && startDate === endDate;

    const chartData = {
      labels: isSameDate
        ? filteredData.map((item: any) => new Date(item.date).getHours() + ':00')
        : filteredData.map((item: any) => item.date),
      datasets: [
        {
          label: 'Energy Consumption (MWh)',
          data: filteredData.map((item: any) => item.consumption_mwh),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Energy Generation (MWh)',
          data: filteredData.map((item: any) => item.generation_mwh),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Consumption vs Generation Over Time', font: { size: 16 } },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Megawatt-hours (MWh)' } },
        x: { title: { display: true, text: isSameDate ? 'Hour' : 'Date' } },
      },
    };

    return (
      <div className="w-[900px] h-[500px] mx-auto bg-white p-4 rounded-lg shadow">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  const SourcePieChart = ({ data }: { data: any }) => {
    const filteredData = filterData(data);

    const sourceData = filteredData.reduce((acc: any, item: any) => {
      acc[item.energy_source] = (acc[item.energy_source] || 0) + 1;
      return acc;
    }, {});

    const chartData = {
      labels: Object.keys(sourceData),
      datasets: [{ data: Object.values(sourceData), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] }],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Energy Source Distribution', font: { size: 16 } },
      },
    };

    return (
      <div className="w-[300px] h-[300px] mx-auto bg-white p-4 rounded-lg shadow">
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
  };

  const RenewableNonRenewablePieChart = ({ data }: { data: any }) => {
    const filteredData = filterData(data);

    const renewableData = filteredData.reduce(
      (acc: any, item: any) => {
        if (item.type === 'Renewable') acc.renewable++;
        else if (item.type === 'Non-Renewable') acc.nonRenewable++;
        return acc;
      },
      { renewable: 0, nonRenewable: 0 }
    );

    const chartData = {
      labels: ['Renewable', 'Non-Renewable'],
      datasets: [{ data: [renewableData.renewable, renewableData.nonRenewable], backgroundColor: ['#36A2EB', '#FF6384'] }],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Renewable vs Non-Renewable', font: { size: 16 } },
      },
    };

    return (
      <div className="w-[300px] h-[300px] mx-auto bg-white p-4 rounded-lg shadow">
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
  };

  const CostRevenueChart = ({ data }: { data: any }) => {
    const filteredData = filterData(data);
    const isSameDate = startDate && endDate && startDate === endDate;

    const chartData = {
      labels: isSameDate
        ? filteredData.map((item: any) => new Date(item.date).getHours() + ':00')
        : filteredData.map((item: any) => item.date),
      datasets: [
        {
          label: 'Cost ($)',
          data: filteredData.map((item: any) => item.price_per_mwh * item.generation_mwh), // Assuming cost is price per MWh times generation
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Revenue ($)',
          data: filteredData.map((item: any) => item.revenue),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          tension: 0.3,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Cost vs Revenue Over Time', font: { size: 16 } },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'USD' } },
        x: { title: { display: true, text: isSameDate ? 'Hour' : 'Date' } },
      },
    };

    return (
      <div className="w-[900px] h-[500px] mx-auto bg-white p-4 rounded-lg shadow">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-6">⚡ Energy Dashboard</h2>

      {user ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-semibold">👋 Welcome, {user}</p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-3">🔍 Filter Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input
                type="date"
                className="border p-2 rounded"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border p-2 rounded"
                value={tempEndDate}
                min={tempStartDate}
                onChange={(e) => setTempEndDate(e.target.value)}
              />
              <input
                type="text"
                placeholder="Energy Source (e.g. Solar)"
                className="border p-2 rounded"
                value={tempSource}
                onChange={(e) => setTempSource(e.target.value)}
              />
              <button
                onClick={handleApplyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            {loading && <p className="text-center text-gray-600">Loading data...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {data && (
              <>
                {/* Dashlets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const filteredData = filterData(data);
                    const { energyGenerated, energyConsumed, revenueGenerated, totalCost } = calculateDashletValues(filteredData);
                    return (
                      <>
                        <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
                          <h4 className="text-lg font-semibold text-blue-800">Energy Generated</h4>
                          <p className="text-2xl font-bold text-blue-600">{energyGenerated.toFixed(2)} MWh</p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg shadow text-center">
                          <h4 className="text-lg font-semibold text-green-800">Energy Consumed</h4>
                          <p className="text-2xl font-bold text-green-600">{energyConsumed.toFixed(2)} MWh</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
                          <h4 className="text-lg font-semibold text-yellow-800">Revenue Generated</h4>
                          <p className="text-2xl font-bold text-yellow-600">${revenueGenerated.toFixed(2)}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg shadow text-center">
                          <h4 className="text-lg font-semibold text-red-800">Total Cost per mwh</h4>
                          <p className="text-2xl font-bold text-red-600">${totalCost.toFixed(2)}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <SourcePieChart data={data} />
                  <RenewableNonRenewablePieChart data={data} />
                </div>
                <div className="space-y-6">
                  <ConsumptionGenerationChart data={data} />
                  <CostRevenueChart data={data} />
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-lg text-red-500">Please log in to view the dashboard and charts.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;