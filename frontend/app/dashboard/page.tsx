'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetch('http://localhost:8000/energy-data')  // Replace with your actual energy data API endpoint
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.error('Failed to fetch data:', err));
    }
  }, [user]);

  const chartData = {
    labels: data ? data.timestamps : [],
    datasets: [
      {
        label: 'Energy Consumption',
        data: data ? data.energyConsumption : [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const handleLogout = () => {
    logout();
    router.push('/login');  // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h2 className="text-3xl font-semibold text-center mb-6">Energy Data Dashboard</h2>
      
      {/* Show the user's email if logged in and provide logout option */}
      {user ? (
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg font-semibold">Welcome, {user}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please log in to view the dashboard.</p>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        {data ? (
          <Line data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Energy Consumption Over Time' } } }} />
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
