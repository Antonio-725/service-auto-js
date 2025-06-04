/* src/components/tabs/ReportsTab.tsx */
import React from 'react';
import styles from '../adminComponents/styles/styles.module.css';
import { FileText } from 'lucide-react';


// Performance Metrics Component
const PerformanceMetrics = () => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>Performance Metrics</h2>
    </div>
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <MetricItem 
          title="Service Completion Rate" 
          value="94%" 
          progress={94} 
          color="#16a34a" 
        />
        <MetricItem 
          title="Customer Satisfaction" 
          value="4.8/5" 
          progress={96} 
          color="#2563eb" 
        />
      </div>
    </div>
  </div>
);

// Metric Item Component
const MetricItem: React.FC<{
  title: string;
  value: string;
  progress: number;
  color: string;
}> = ({ title, value, progress, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{title}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1a202c' }}>{value}</span>
    </div>
    <div style={{
      width: '100%',
      height: '0.5rem',
      backgroundColor: '#e2e8f0',
      borderRadius: '9999px',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '100%',
        borderRadius: '9999px',
        width: `${progress}%`,
        backgroundColor: color
      }}></div>
    </div>
  </div>
);

// Monthly Reports Component
const MonthlyReports = () => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className={styles.cardTitle}>Monthly Reports</h2>
        <GenerateReportButton />
      </div>
    </div>
    <div style={{ padding: '1.5rem' }}>
      <EmptyReportsState />
    </div>
  </div>
);

// Generate Report Button Component
const GenerateReportButton = () => (
  <button
    className={styles.generateReportButton}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
  >
    Generate Report
  </button>
);

// Empty Reports State Component
const EmptyReportsState = () => (
  <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
    <FileText size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
    <p style={{ margin: '0 0 0.5rem 0' }}>No reports generated yet</p>
    <p style={{ fontSize: '0.875rem', margin: 0 }}>Click the button above to create your first report</p>
  </div>
);

const ReportsTab = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <PerformanceMetrics />
    <MonthlyReports />
  </div>
);

export default ReportsTab;
