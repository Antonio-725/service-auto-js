import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Calendar, Settings, Clock, Wrench, CheckCircle, TrendingUp } from 'lucide-react';
import Sidebar from '../components/adminComponents/Sidebar';
import OverviewTab from '../components/adminComponents/OverviewTab';
import ServicesTab from '../components/adminComponents/ServicesTab';
import ReportsTab from '../components/adminComponents/ReportsTab';
import SparePartsTab from '../components/adminComponents/SparePartsTab';
import SparePartRequestsTab from '../components/adminComponents/SparePartRequestsTab';
import { fetchServices, fetchMechanics, updateService } from '../services/serviceApi';
import InvoicesTab from '../components/adminComponents/InvoicesTab';
import { getInvoices, logout } from '../utils/apiClient';
import Loading from '../components/usables/Loading';
import styles from '../components/adminComponents/styles/styles.module.css';

// Import interfaces from the separate types file (excluding unused ApiError)
import type {
  StatCard,
  ServiceRequest,
  InvoiceResponse,
  Mechanic,
  StatusCounts,
  ServiceStatus,
} from '../types/adminTypes';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const [servicesData, mechanicsData, invoicesData] = await Promise.all([
          fetchServices(),
          fetchMechanics(),
          getInvoices(),
        ]);
        setServiceRequests(servicesData);
        setMechanics(mechanicsData);
        setInvoices(invoicesData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (
    requestId: string,
    mechanicId: string | null,
    status: string
  ): Promise<void> => {
    try {
      await updateService(requestId, {
        mechanicId,
        status: status as ServiceStatus,
      });

      setServiceRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                mechanic: mechanicId ? mechanics.find(m => m.id === mechanicId) || null : null,
                status: status as ServiceStatus,
              }
            : req
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusCounts = (): StatusCounts => {
    return serviceRequests.reduce(
      (acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      { Pending: 0, "In Progress": 0, Completed: 0, Cancelled: 0 } as StatusCounts
    );
  };

  const calculateStats = (): StatCard[] => {
    const statusCounts = getStatusCounts();
    const today = new Date().toISOString().split('T')[0];

    const paidInvoicesToday = invoices.filter(
      invoice => invoice.status === 'Paid' && invoice.updatedAt.split('T')[0] === today
    );

    const totalRevenue = paidInvoicesToday.reduce(
      (sum, invoice) => sum + (Number(invoice.totalAmount) || 0),
      0
    );

    const completedToday = serviceRequests.filter(
      req => req.status === 'Completed' && req.date.split('T')[0] === today
    ).length;

    const totalServices = serviceRequests.length;

    return [
      {
        title: "Total Services",
        value: totalServices.toString(),
        change: "0%",
        icon: Settings,
        color: "blue",
      },
      {
        title: "Pending",
        value: statusCounts.Pending.toString(),
        change: "0%",
        icon: Clock,
        color: "orange",
      },
      {
        title: "In Progress",
        value: statusCounts["In Progress"].toString(),
        change: "0%",
        icon: Wrench,
        color: "yellow",
      },
      {
        title: "Completed Today",
        value: completedToday.toString(),
        change: "0%",
        icon: CheckCircle,
        color: "green",
      },
      {
        title: "Revenue (Today)",
        value: `$${totalRevenue.toLocaleString()}`,
        change: "0%",
        icon: TrendingUp,
        color: "purple",
      },
    ];
  };

  const handleLogout = (): void => {
    logout();
  };

  if (loading) {
    return <Loading message="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Error Loading Dashboard
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Admin Dashboard</h1>
          <p className={styles.headerSubtitle}>Manage your automotive services</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.dateInfo}>
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className={styles.avatar}></div>
          <button onClick={handleLogout} className={styles.logoutButton} aria-label="Log out of admin dashboard">
            Logout
          </button>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className={styles.mainContent}>
          {activeTab === "overview" && <OverviewTab
            stats={calculateStats()}
            statusCounts={getStatusCounts()}
            serviceRequests={serviceRequests}
            mechanics={mechanics}
            onAssign={handleAssign}
          />}

          {activeTab === "services" && <ServicesTab
            serviceRequests={serviceRequests}
            mechanics={mechanics}
            onAssign={handleAssign}
          />}

          {activeTab === "spare-parts" && <SparePartsTab />}

          {activeTab === "invoices" && <InvoicesTab />}

          {activeTab === "spare-part-requests" && <SparePartRequestsTab />}

          {activeTab === "reports" && <ReportsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
