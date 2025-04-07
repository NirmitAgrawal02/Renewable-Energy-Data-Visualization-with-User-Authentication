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

// Define types for EnergyData
interface EnergyData {
  id: number;
  date: string;
  hour_beginning: string;
  hour_ending: string;
  energy_source: string;
  type: string;
  consumption_mwh: number;
  generation_mwh: number;
  weather: string;
  price_per_mwh: number;
  revenue: number;
}

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<EnergyData[] | null>(null);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login Failed');
      } else {
        setError('Login Failed');
      }
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

  const filterData = (data: EnergyData[]): EnergyData[] => {
    let filteredData = data;
    
    if (startDate) {
      filteredData = filteredData.filter((item) => new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredData = filteredData.filter((item) => new Date(item.date) <= new Date(endDate));
    }
    if (source) {
      filteredData = filteredData.filter((item) => item.energy_source.toLowerCase() === source.toLowerCase());
    }
    
    return filteredData;
  };

  const calculateDashletValues = (filteredData: EnergyData[]) => {
    const energyGenerated = filteredData.reduce((acc: number, item: EnergyData) => acc + item.generation_mwh, 0);
    const energyConsumed = filteredData.reduce((acc: number, item: EnergyData) => acc + item.consumption_mwh, 0);
    const revenueGenerated = filteredData.reduce((acc: number, item: EnergyData) => acc + item.revenue, 0);
    const totalCost = filteredData.reduce((acc: number, item: EnergyData) => acc + item.price_per_mwh, 0);

    return { energyGenerated, energyConsumed, revenueGenerated, totalCost };
  };

  const ConsumptionGenerationChart = ({ data }: { data: EnergyData[] }) => {
    const filteredData = filterData(data);
    const isSameDate = startDate && endDate && startDate === endDate;

    const chartData = {
      labels: isSameDate
        ? filteredData.map((item) => new Date(item.date).getHours() + ':00')
        : filteredData.map((item) => item.date),
      datasets: [
        {
          label: 'Energy Consumption (MWh)',
          data: filteredData.map((item) => item.consumption_mwh),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Energy Generation (MWh)',
          data: filteredData.map((item) => item.generation_mwh),
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
      <div className="w-[900px] h-[500px] mx-auto bg-white p-6 rounded-lg shadow">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  const SourcePieChart = ({ data }: { data: EnergyData[] }) => {
    const filteredData = filterData(data);

    const sourceData = filteredData.reduce((acc: Record<string, number>, item: EnergyData) => {
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
      <div className="w-[300px] h-[300px] bg-white p-6 rounded-lg shadow">
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
  };

  const RenewableNonRenewablePieChart = ({ data }: { data: EnergyData[] }) => {
    const filteredData = filterData(data);
    const renewableData = filteredData.reduce(
      (acc: { renewable: number; nonRenewable: number }, item: EnergyData) => {
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
      <div className="w-[300px] h-[300px] bg-white p-6 rounded-lg shadow">
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
  };

  const CostRevenueChart = ({ data }: { data: EnergyData[] }) => {
    const filteredData = filterData(data);
    const isSameDate = startDate && endDate && startDate === endDate;

    const chartData = {
      labels: isSameDate
        ? filteredData.map((item) => new Date(item.date).getHours() + ':00')
        : filteredData.map((item) => item.date),
      datasets: [
        {
          label: 'Cost ($)',
          data: filteredData.map((item) => item.price_per_mwh * item.generation_mwh),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Revenue ($)',
          data: filteredData.map((item) => item.revenue),
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
      <div className="w-[900px] h-[500px] mx-auto bg-white p-6 rounded-lg shadow">
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

          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <label className="text-lg">Start Date</label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <label className="text-lg">End Date</label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <label className="text-lg">Energy Source</label>
              <select
                value={tempSource}
                onChange={(e) => setTempSource(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">All Sources</option>
                <option value="Solar">Solar</option>
                <option value="Wind">Wind</option>
                <option value="Hydro">Hydro</option>
                <option value="Coal">Coal</option>
                <option value="Natural Gas">Natural Gas</option>
              </select>
            </div>
            <button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>

          {error && <div className="bg-red-100 p-4 rounded text-red-600">{error}</div>}

          {loading ? (
            <div className="text-center text-xl">Loading...</div>
          ) : data ? (
            <div>
              {/* Dashlets in a single line */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-semibold">Energy Generated</h3>
                  <p>{calculateDashletValues(data).energyGenerated} MWh</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-semibold">Energy Consumed</h3>
                  <p>{calculateDashletValues(data).energyConsumed} MWh</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-semibold">Revenue</h3>
                  <p>${calculateDashletValues(data).revenueGenerated}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-semibold">Total Cost</h3>
                  <p>${calculateDashletValues(data).totalCost}</p>
                </div>
              </div>

              {/* Pie charts on the same horizontal line with spacing */}
              <div className="flex justify-center gap-8 mb-8">
                <SourcePieChart data={data} />
                <RenewableNonRenewablePieChart data={data} />
              </div>

              {/* Line charts with spacing */}
              <div className="mb-8">
                <ConsumptionGenerationChart data={data} />
              </div>
              <div>
                <CostRevenueChart data={data} />
              </div>
            </div>
          ) : (
            <div className="text-center text-xl">No data available</div>
          )}
        </>
      ) : (
        <div className="text-center text-xl">Please log in to access the dashboard</div>
      )}
    </div>
  );
};

export default DashboardPage;