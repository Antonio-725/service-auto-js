import React from 'react';
import { Bar } from 'react-chartjs-2';
import ServiceRequestsTable from '../ServiceRequestsTable';
import StatsCards from '../StatsCards';
import styles from '../adminComponents/styles/styles.module.css';
import {
  Chart as ChartJS,
  registerables
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
//import type { SVGProps } from 'react';
// Register Chart.js components
ChartJS.register(...registerables);

// Types
interface StatCard {
  title: string;
  value: string;
  change: string;
  //icon: React.ComponentType;
   icon: React.ComponentType<any>;
  // icon: React.ComponentType<SVGProps<SVGSVGElement>>;
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
}> = ({ stats, serviceRequests, mechanics, onAssign }) => {
  const { statusCountsByDate, sortedDates } = aggregateServiceData(serviceRequests);

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Pending',
        data: sortedDates.map(date => statusCountsByDate[date].Pending),
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(251, 146, 60, 0.9)',
        hoverBorderColor: 'rgba(251, 146, 60, 1)',
        hoverBorderWidth: 3,
      },
      {
        label: 'In Progress',
        data: sortedDates.map(date => statusCountsByDate[date]["In Progress"]),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
        hoverBorderColor: 'rgba(59, 130, 246, 1)',
        hoverBorderWidth: 3,
      },
      {
        label: 'Completed',
        data: sortedDates.map(date => statusCountsByDate[date].Completed),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(34, 197, 94, 0.9)',
        hoverBorderColor: 'rgba(34, 197, 94, 1)',
        hoverBorderWidth: 3,
      },
      {
        label: 'Cancelled',
        data: sortedDates.map(date => statusCountsByDate[date].Cancelled),
        backgroundColor: 'rgba(148, 163, 184, 0.8)',
        borderColor: 'rgba(148, 163, 184, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(148, 163, 184, 0.9)',
        hoverBorderColor: 'rgba(148, 163, 184, 1)',
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 13,
            family: 'Inter, system-ui, -apple-system, sans-serif',
            weight: 'normal' as const, // Changed from '500' to 'normal'
          },
          color: '#374151',
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original(chart);
            
            labels.forEach((label) => {
              label.pointStyle = 'circle';
            });
            
            return labels;
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const, // Changed from '600' to 'bold'
        },
        bodyFont: {
          size: 13,
          weight: 'normal' as const, // Changed from '500' to 'normal'
        },
        callbacks: {
          title: (tooltipItems) => {
            return `Date: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} requests`;
          },
        },
       // boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Date Range',
          color: '#374151',
          font: {
            size: 14,
            family: 'Inter, system-ui, -apple-system, sans-serif',
            weight: 'bold' as const, // Changed from '600' to 'bold'
          },
          padding: { top: 10 },
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal' as const, // Changed from '500' to 'normal'
          },
          maxRotation: 0,
          minRotation: 0,
          padding: 8,
        },
        grid: {
          display: false,
        },
        border: {
          color: '#E5E7EB',
          width: 1,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Service Requests',
          color: '#374151',
          font: {
            size: 14,
            family: 'Inter, system-ui, -apple-system, sans-serif',
            weight: 'bold' as const, // Changed from '600' to 'bold'
          },
          padding: { bottom: 10 },
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'normal' as const, // Changed from '500' to 'normal'
          },
          stepSize: 1,
          padding: 8,
          callback: (value: any) => (Number.isInteger(value) ? value : null),
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.8)',
          lineWidth: 1,
        //  drawBorder: false,
        },
        border: {
          color: '#E5E7EB',
          width: 1,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
      },
    },
  };

  return (
    <div>
      <StatsCards stats={stats} />
      
      <div className={`${styles.card} professional-chart-container`}>
        <div className={`${styles.cardHeader} chart-header`}>
          <div className="chart-title-section">
            <h2 className={`${styles.cardTitle} chart-main-title`}>Service Request Analytics</h2>
            <p className="chart-subtitle">Daily distribution of service request statuses</p>
          </div>
          <div className="chart-actions">
            <div className="time-period-indicator">
              <span className="period-label">Period:</span>
              <span className="period-value">Last 30 days</span>
            </div>
          </div>
        </div>
        <div className="chart-wrapper">
          {sortedDates.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="no-data-state">
              <div className="no-data-icon">📊</div>
              <h3 className="no-data-title">No Data Available</h3>
              <p className="no-data-description">
                Service request data will appear here once requests are created
              </p>
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

      <style>{`
        .professional-chart-container {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(229, 231, 235, 1);
          border-radius: 12px;
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          overflow: hidden;
          margin: 1.5rem 0;
        }

        .chart-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid rgba(229, 231, 235, 0.8);
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .chart-title-section {
          flex: 1;
        }

        .chart-main-title {
          color: #111827;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .chart-subtitle {
          color: #6B7280;
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .chart-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .time-period-indicator {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(229, 231, 235, 1);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .period-label {
          color: #6B7280;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .period-value {
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .chart-wrapper {
          padding: 2rem;
          height: 400px;
          position: relative;
          background: #ffffff;
        }

        .no-data-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #6B7280;
        }

        .no-data-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-data-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.5rem 0;
        }

        .no-data-description {
          font-size: 0.875rem;
          color: #6B7280;
          margin: 0;
          max-width: 300px;
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .chart-actions {
            justify-content: flex-start;
          }

          .chart-wrapper {
            padding: 1rem;
            height: 350px;
          }

          .chart-main-title {
            font-size: 1.25rem;
          }
        }

        .professional-chart-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .professional-chart-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .professional-chart-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .professional-chart-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default OverviewTab;