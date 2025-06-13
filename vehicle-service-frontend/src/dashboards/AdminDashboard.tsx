import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Calendar, Settings, Clock, Wrench, CheckCircle, TrendingUp } from 'lucide-react';
import Sidebar from '../components/adminComponents/Sidebar';
import OverviewTab from '../components/adminComponents/OverviewTab';
import ServicesTab from '../components/adminComponents/ServicesTab';
import ReportsTab from '../components/adminComponents/ReportsTab';
import SparePartsTab from '../components/adminComponents/SparePartsTab';
import SparePartRequestsTab from '../components/adminComponents/SparePartRequestsTab';
import { fetchServices, fetchMechanics, updateService } from '../services/serviceApi';
import { logout } from '../utils/apiClient';
import styles from '../components/adminComponents/styles/styles.module.css';

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
  mechanic: { id: string; username: string; phone: string } | null;
  priority?: string;
}

interface Mechanic {
  id: string;
  username: string;
  phone: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, mechanicsData] = await Promise.all([
          fetchServices(),
          fetchMechanics()
        ]);
        setServiceRequests(servicesData);
        setMechanics(mechanicsData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (requestId: string, mechanicId: string | null, status: string) => {
    try {
      const updatedService = await updateService(requestId, { 
        mechanicId, 
        status: status as ServiceRequest['status'] 
      });
      
      setServiceRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { 
                ...req, 
                mechanic: mechanicId ? mechanics.find(m => m.id === mechanicId) || null : null,
                status: status as ServiceRequest['status']
              }
            : req
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusCounts = () => {
    return serviceRequests.reduce(
      (acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      { Pending: 0, "In Progress": 0, Completed: 0, Cancelled: 0 }
    );
  };

  const calculateStats = (): StatCard[] => {
    const statusCounts = getStatusCounts();
    const today = new Date().toISOString().split('T')[0];
    const completedToday = serviceRequests.filter(
      req => req.status === 'Completed' && req.date.split('T')[0] === today
    ).length;

    const totalServices = serviceRequests.length;
    const totalRevenue = serviceRequests
      .filter(req => req.status === 'Completed')
      .reduce((sum, req) => sum + (req.rating ? req.rating * 100 : 0), 0);

    return [
      { 
        title: "Total Services", 
        value: totalServices.toString(), 
        change: "0%", 
        icon: Settings, 
        color: "blue" 
      },
      { 
        title: "Pending", 
        value: statusCounts.Pending.toString(), 
        change: "0%", 
        icon: Clock, 
        color: "orange" 
      },
      { 
        title: "In Progress", 
        value: statusCounts["In Progress"].toString(), 
        change: "0%", 
        icon: Wrench, 
        color: "yellow" 
      },
      { 
        title: "Completed Today", 
        value: completedToday.toString(), 
        change: "0%", 
        icon: CheckCircle, 
        color: "green" 
      },
      { 
        title: "Revenue", 
        value: `$${totalRevenue.toLocaleString()}`, 
        change: "0%", 
        icon: TrendingUp, 
        color: "purple" 
      }
    ];
  };

  const handleLogout = () => {
    logout(); // Clear localStorage and redirect to /login
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

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
          {activeTab === "spare-part-requests" && <SparePartRequestsTab />}
          {activeTab === "reports" && <ReportsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;