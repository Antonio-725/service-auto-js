import React, { useState } from 'react';
import ServiceRequestsTable from '../ServiceRequestsTable';

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


const ServicesTab: React.FC<{
  serviceRequests: ServiceRequest[];
  mechanics: Mechanic[];
  onAssign: (requestId: string, mechanicId: string | null, status: string) => void;
}> = ({ serviceRequests, mechanics, onAssign }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter service requests based on status, priority, and search term
  const filteredRequests = serviceRequests.filter(request => {
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || request.priority === priorityFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      request.description.toLowerCase().includes(searchLower) ||
      request.vehicle.make.toLowerCase().includes(searchLower) ||
      request.vehicle.model.toLowerCase().includes(searchLower) ||
      request.vehicle.plate.toLowerCase().includes(searchLower) ||
      (request.mechanic?.username || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Unique values for filters
  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];
  const priorityOptions = ['All', ...new Set(serviceRequests.map(req => req.priority).filter(p => p))];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className={styles.cardTitle}>All Service Requests</h2>
          
        </div>
        <div className={styles.filterContainer}>
          <div>
            <label className={styles.filterLabel}>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.filterLabel}>Filter by Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {priorityOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.filterLabel}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, make, model, plate, or mechanic..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>
      <ServiceRequestsTable
        requests={filteredRequests}
        mechanics={mechanics}
        onAssign={onAssign}
        showAllColumns={true}
      />
    </div>
  );
};

export default ServicesTab;