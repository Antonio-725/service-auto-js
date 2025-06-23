import React, { useState, useEffect } from 'react';
import styles from '../adminComponents/styles/styles.module.css';
import { FileText } from 'lucide-react';
import { fetchServices, fetchMechanics } from '../../services/serviceApi';
import { getInvoices } from '../../utils/apiClient';

interface ServiceRequest {
  id: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  rating: number | null;
  createdAt: string;
  completedAt?: string;
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

interface InvoiceResponse {
  id: string;
  serviceId: string;
  vehicleId: string;
  userId: string;
  items: { 
    description: string; 
    quantity: number; 
    unitPrice: number; 
    total: number 
  }[];
  laborCost: number;
  partsCost: number;
  tax: number;
  totalAmount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Mechanic {
  id: string;
  username: string;
  phone: string;
}

interface ReportData {
  month: string;
  summary: string;
  revenue: number;
  servicesCount: number;
  completedCount: number;
  avgRating: number;
}

interface MetricItemProps {
  title: string;
  value: string;
  progress: number;
  color: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ title, value, progress, color }) => (
  <div className={styles.metricItem}>
    <div className={styles.metricHeader}>
      <span className={styles.metricTitle}>{title}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
    <div className={styles.progressBar}>
      <div 
        className={styles.progressFill} 
        style={{ 
          width: `${Math.min(Math.max(progress, 0), 100)}%`, 
          backgroundColor: color 
        }}
      />
    </div>
  </div>
);

const PerformanceMetrics: React.FC<{
  serviceRequests: ServiceRequest[];
  invoices: InvoiceResponse[];
  mechanics: Mechanic[];
}> = ({ serviceRequests, invoices, mechanics }) => {
  const totalServices = serviceRequests.length;
  const completedServices = serviceRequests.filter(req => req.status === 'Completed').length;
  const completionRate = totalServices > 0 ? (completedServices / totalServices) * 100 : 0;

  const ratedServices = serviceRequests.filter(req => req.rating !== null);
  const avgRating = ratedServices.length > 0
    ? ratedServices.reduce((sum, req) => sum + (req.rating || 0), 0) / ratedServices.length
    : 0;

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'Paid')
    .reduce((sum, invoice) => sum + (Number(invoice.totalAmount) || 0), 0);

  const activeMechanics = new Set(
    serviceRequests
      .filter(req => req.mechanic && ['Pending', 'In Progress'].includes(req.status))
      .map(req => req.mechanic!.id)
  ).size;
  
  const mechanicUtilization = mechanics.length > 0 
    ? (activeMechanics / mechanics.length) * 100 
    : 0;

  const completedWithTimes = serviceRequests.filter(
    req => req.status === 'Completed' && req.createdAt && req.completedAt
  );
  
  const avgCompletionTime = completedWithTimes.length > 0
    ? completedWithTimes.reduce((sum, req) => {
        const created = new Date(req.createdAt).getTime();
        const completed = new Date(req.completedAt!).getTime();
        return sum + (completed - created) / (1000 * 60 * 60);
      }, 0) / completedWithTimes.length
    : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Performance Metrics</h2>
      </div>
      <div className={styles.metricsContainer}>
        <MetricItem
          title="Service Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          progress={completionRate}
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
          value={avgCompletionTime > 0 ? `${avgCompletionTime.toFixed(1)} hrs` : 'N/A'}
          progress={avgCompletionTime > 0 ? Math.min(avgCompletionTime * 10, 100) : 0}
          color="#f59e0b"
        />
        <MetricItem
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          progress={Math.min(totalRevenue / 1000, 100)}
          color="#9333ea"
        />
        <MetricItem
          title="Mechanic Utilization"
          value={`${mechanicUtilization.toFixed(1)}%`}
          progress={mechanicUtilization}
          color="#ec4899"
        />
      </div>
    </div>
  );
};

const GenerateReportButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    className={styles.generateReportButton}
    onClick={onClick}
  >
    Generate Report
  </button>
);

const EmptyReportsState = () => (
  <div className={styles.emptyState}>
    <FileText size={48} className={styles.emptyIcon} />
    <p className={styles.emptyText}>No reports generated yet</p>
    <p className={styles.emptySubtext}>Click the button above to create your first report</p>
  </div>
);

const MonthlyReports: React.FC<{
  serviceRequests: ServiceRequest[];
  invoices: InvoiceResponse[];
}> = ({ serviceRequests, invoices }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [reports, setReports] = useState<ReportData[]>([]);

  const generateReport = () => {
    if (reports.some(report => report.month === selectedMonth)) {
      alert('Report for this month already exists!');
      return;
    }

    const monthServices = serviceRequests.filter(
      req => req.date && req.date.slice(0, 7) === selectedMonth
    );
    
    const monthInvoices = invoices.filter(
      invoice => invoice.status === 'Paid' && 
      invoice.updatedAt && 
      invoice.updatedAt.slice(0, 7) === selectedMonth
    );

    const totalServices = monthServices.length;
    const completedServices = monthServices.filter(
      req => req.status === 'Completed'
    ).length;
    
    const revenue = monthInvoices.reduce(
      (sum, invoice) => sum + (Number(invoice.totalAmount) || 0), 
      0
    );

    const ratedServices = monthServices.filter(req => req.rating !== null);
    const avgRating = ratedServices.length > 0
      ? ratedServices.reduce((sum, req) => sum + (req.rating || 0), 0) / ratedServices.length
      : 0;

    const summary = `Services: ${totalServices}, Completed: ${completedServices}, Revenue: $${revenue.toLocaleString()}, Avg. Rating: ${avgRating.toFixed(1)}/5`;

    const newReport: ReportData = {
      month: selectedMonth,
      summary,
      revenue,
      servicesCount: totalServices,
      completedCount: completedServices,
      avgRating,
    };

    setReports(prev => [...prev, newReport].sort((a, b) => b.month.localeCompare(a.month)));
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
          <div className={styles.reportListContainer}>
            <ul className={styles.reportList}>
              {reports.map((report, index) => (
                <li key={`${report.month}-${index}`} className={styles.reportItem}>
                  <div>
                    <span className={styles.reportMonth}>
                      {new Date(report.month + '-01').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  <div className={styles.reportSummary}>
                    {report.summary}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsTab: React.FC = () => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [servicesData, mechanicsData, invoicesData] = await Promise.all([
          fetchServices(),
          fetchMechanics(),
          getInvoices(),
        ]);

        setServiceRequests(servicesData || []);
        setMechanics(mechanicsData || []);
        setInvoices(invoicesData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.emptyState}>
        <div>Loading reports data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.errorText}>Error loading data</div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.tabContainer}>
      <PerformanceMetrics
        serviceRequests={serviceRequests}
        invoices={invoices}
        mechanics={mechanics}
      />
      <MonthlyReports
        serviceRequests={serviceRequests}
        invoices={invoices}
      />
    </div>
  );
};

export default ReportsTab;