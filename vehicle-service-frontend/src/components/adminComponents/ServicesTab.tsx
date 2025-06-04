/* src/components/tabs/ServicesTab.tsx */
import React from 'react';
import ServiceRequestsTable from '../ServiceRequestsTable';
import { ChevronDown } from 'lucide-react';
import styles from '../adminComponents/styles/styles.module.css';


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

const NewRequestButton = () => (
  <button
    className={styles.newRequestButton}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
  >
    <span>New Request</span>
    <ChevronDown size={16} />
  </button>
);

const ServicesTab: React.FC<{
  serviceRequests: ServiceRequest[];
  mechanics: Mechanic[];
  onAssign: (requestId: string, mechanicId: string | null, status: string) => void;
}> = ({ serviceRequests, mechanics, onAssign }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className={styles.cardTitle}>All Service Requests</h2>
        <NewRequestButton />
      </div>
    </div>
    <ServiceRequestsTable
      requests={serviceRequests}
      mechanics={mechanics}
      onAssign={onAssign}
      showAllColumns={true}
    />
  </div>
);

export default ServicesTab;
