/* src/components/tabs/OverviewTab.tsx */
import React from 'react';
import { Line } from 'react-chartjs-2';
import ServiceRequestsTable from '../ServiceRequestsTable';
import StatsCards from '../StatsCards';
import styles from '../adminComponents/styles/styles.module.css';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js';
import type { ChartOptions } from 'chart.js';



// Types
interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType;
  color: string;
}

interface ServiceRequest {
  id: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  rating: number | null;
  createdAt: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    plate: string;
    year: string;
    owner: {
      id: string;
      username: string;
      phone: string;
      email: string;
    };
  };
  mechanic: {
  id: string;
  username: string;
  phone: string;
} | null;

  priority?: string;
}

interface Mechanic {
  id: string;
  username: string;
  phone: string;
}

// Utility function to aggregate service data by date
const aggregateServiceData = (serviceRequests: ServiceRequest[]) => {
  const statusCountsByDate: { [date: string]: { [status: string]: number } } = {};

  serviceRequests.forEach((req) => {
    const date = new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!statusCountsByDate[date]) {
      statusCountsByDate[date] = {
        Pending: 0,
        "In Progress": 0,
        Completed: 0,
        Cancelled: 0,
      };
    }
    statusCountsByDate[date][req.status]++;
  });

  const sortedDates = Object.keys(statusCountsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return { statusCountsByDate, sortedDates };
};

const OverviewTab: React.FC<{
  stats: StatCard[];
  statusCounts: Record<string, number>;
  serviceRequests: ServiceRequest[];
  mechanics: Mechanic[];
  onAssign: (requestId: string, mechanicId: string | null, status: string) => void;
}> = ({ stats, statusCounts, serviceRequests, mechanics, onAssign }) => {
  const { statusCountsByDate, sortedDates } = aggregateServiceData(serviceRequests);

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Pending',
        data: sortedDates.map(date => statusCountsByDate[date].Pending),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.2)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'In Progress',
        data: sortedDates.map(date => statusCountsByDate[date]["In Progress"]),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: sortedDates.map(date => statusCountsByDate[date].Completed),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Cancelled',
        data: sortedDates.map(date => statusCountsByDate[date].Cancelled),
        borderColor: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.2)',
        fill: false,
        tension: 0.4,
      },
    ],
  };
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12,
          family: 'system-ui, -apple-system, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1a202c',
      bodyColor: '#1a202c',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      type: 'category',
      title: {
        display: true,
        text: 'Date',
        color: '#1a202c',
        font: {
          size: 12,
          family: 'system-ui, -apple-system, sans-serif',
        },
      },
      ticks: {
        color: '#64748b',
        maxRotation: 45,
        minRotation: 0,
      },
      grid: {
        display: false,
      },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Services',
        color: '#1a202c',
        font: {
          size: 12,
        },
      },
      ticks: {
        color: '#64748b',
        stepSize: 1,
        callback: (value: any) => (Number.isInteger(value) ? value : null),
      },
      grid: {
        color: '#e2e8f0',
      },
    },
  },
};


  return (
    <div>
      <StatsCards stats={stats} />
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Service Status Distribution</h2>
        </div>
        <div style={{ padding: '1.5rem', height: '300px' }}>
          {sortedDates.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '100px' }}>
              No data available for the chart
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Active Service Requests</h2>
        </div>
        <ServiceRequestsTable
          requests={serviceRequests.filter(req => ['Pending', 'In Progress'].includes(req.status))}
          mechanics={mechanics}
          onAssign={onAssign}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
