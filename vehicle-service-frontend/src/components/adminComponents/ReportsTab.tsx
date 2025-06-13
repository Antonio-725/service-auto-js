import React, { useState, useEffect } from 'react';
import styles from '../adminComponents/styles/styles.module.css';
import { FileText } from 'lucide-react';
import { fetchServices, fetchMechanics } from '../../services/serviceApi';

// Types
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

// Performance Metrics Component
const PerformanceMetrics: React.FC<{ serviceRequests?: ServiceRequest[]; mechanics?: Mechanic[] }> = ({ serviceRequests = [], mechanics = [] }) => {
  // Calculate metrics with safe defaults
  const totalServices = serviceRequests.length;
  const completedServices = serviceRequests.filter(req => req.status === 'Completed').length;
  const completionRate = totalServices > 0 ? ((completedServices / totalServices) * 100).toFixed(1) : '0';
  const avgRating = serviceRequests.filter(req => req.rating).reduce((sum, req) => sum + (req.rating || 0), 0) / (serviceRequests.filter(req => req.rating).length || 1);
  const totalRevenue = serviceRequests.filter(req => req.status === 'Completed').reduce((sum, req) => sum + (req.rating ? req.rating * 100 : 0), 0);
  const assignedMechanics = new Set(serviceRequests.filter(req => req.mechanic).map(req => req.mechanic!.id)).size;
  const mechanicUtilization = mechanics.length > 0 ? ((assignedMechanics / mechanics.length) * 100).toFixed(1) : '0';

  // Mock average completion time (in hours) - replace with real calculation if date fields allow
  const avgCompletionTime = serviceRequests.filter(req => req.status === 'Completed').length > 0 ? 4.2 : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Performance Metrics</h2>
      </div>
      <div className={styles.metricsContainer}>
        <MetricItem 
          title="Service Completion Rate" 
          value={`${completionRate}%`} 
          progress={parseFloat(completionRate)} 
          color="#16a34a" 
        />
        <MetricItem 
          title="Customer Satisfaction" 
          value={`${avgRating.toFixed(1)}/5`} 
          progress={avgRating * 20} 
          color="#2563eb" 
        />
        <MetricItem 
          title="Avg. Completion Time" 
          value={`${avgCompletionTime.toFixed(1)} hrs`} 
          progress={Math.min(avgCompletionTime * 10, 100)} 
          color="#f59e0b" 
        />
        <MetricItem 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          progress={Math.min(totalRevenue / 100, 100)} 
          color="#9333ea" 
        />
        <MetricItem 
          title="Mechanic Utilization" 
          value={`${mechanicUtilization}%`} 
          progress={parseFloat(mechanicUtilization)} 
          color="#ec4899" 
        />
      </div>
    </div>
  );
};

// Metric Item Component
const MetricItem: React.FC<{
  title: string;
  value: string;
  progress: number;
  color: string;
}> = ({ title, value, progress, color }) => (
  <div className={styles.metricItem}>
    <div className={styles.metricHeader}>
      <span className={styles.metricTitle}>{title}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
    <div className={styles.progressBar}>
      <div className={styles.progressFill} style={{ width: `${progress}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

// Monthly Reports Component
const MonthlyReports: React.FC<{ serviceRequests?: ServiceRequest[] }> = ({ serviceRequests = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [reports, setReports] = useState<{ month: string; summary: string }[]>([]);

  const generateReport = () => {
    const monthServices = serviceRequests.filter(req => req.date.slice(0, 7) === selectedMonth);
    const completed = monthServices.filter(req => req.status === 'Completed').length;
    const revenue = monthServices.filter(req => req.status === 'Completed').reduce((sum, req) => sum + (req.rating ? req.rating * 100 : 0), 0);
    const avgRating = monthServices.filter(req => req.rating).reduce((sum, req) => sum + (req.rating || 0), 0) / (monthServices.filter(req => req.rating).length || 1);
    const summary = `Services: ${monthServices.length}, Completed: ${completed}, Revenue: $${revenue.toLocaleString()}, Avg. Rating: ${avgRating.toFixed(1)}/5`;
    setReports(prev => [...prev, { month: selectedMonth, summary }]);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerFlex}>
          <h2 className={styles.cardTitle}>Monthly Reports</h2>
          <div className={styles.reportControls}>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.monthInput}
            />
            <GenerateReportButton onClick={generateReport} />
          </div>
        </div>
      </div>
      <div className={styles.reportContent}>
        {reports.length === 0 ? (
          <EmptyReportsState />
        ) : (
          <ul className={styles.reportList}>
            {reports.map((report, index) => (
              <li key={index} className={styles.reportItem}>
                <span>{report.month}</span>
                <span>{report.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Generate Report Button Component
const GenerateReportButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    className={styles.generateReportButton}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
    onClick={onClick}
  >
    Generate Report
  </button>
);

// Empty Reports State Component
const EmptyReportsState = () => (
  <div className={styles.emptyState}>
    <FileText size={48} className={styles.emptyIcon} />
    <p className={styles.emptyText}>No reports generated yet</p>
    <p className={styles.emptySubtext}>Click the button above to create your first report</p>
  </div>
);

// Reports Tab Component with Data Fetching
const ReportsTab: React.FC = () => {
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

  if (loading) return <div className={styles.emptyState}>Loading...</div>;
  if (error) return <div className={styles.emptyState}>Error: {error}</div>;

  return (
    <div className={styles.tabContainer}>
      <PerformanceMetrics serviceRequests={serviceRequests} mechanics={mechanics} />
      <MonthlyReports serviceRequests={serviceRequests} />
    </div>
  );
};

export default ReportsTab;