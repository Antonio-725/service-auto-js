import React, { useState } from "react";
import {
  Clock,
  Wrench,
  CheckCircle,
  ChevronDown,
  User as UserIcon,
  Car,
  Mail,
  Phone
} from "lucide-react";

interface Vehicle {
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
}

interface Mechanic {
  id: string;
  username: string;
  phone: string;
}

interface Service {
  id: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  rating: number | null;
  createdAt: string;
  vehicle: Vehicle;
  mechanic: Mechanic | null;
  priority?: string;
}

interface ServiceRequestsTableProps {
  requests: Service[];
  mechanics: Mechanic[];
  onAssign: (requestId: string, mechanicId: string | null, status: string) => void;
  showAllColumns?: boolean;
}

const ServiceRequestsTable: React.FC<ServiceRequestsTableProps> = ({
  requests,
  mechanics,
  onAssign,
  showAllColumns = false
}) => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [selectedMechanics, setSelectedMechanics] = useState<{ [key: string]: string | null }>({});
  const [selectedStatuses, setSelectedStatuses] = useState<{ [key: string]: string }>({});
  const [isAssigning, setIsAssigning] = useState<{ [key: string]: boolean }>({}); // Track loading state per request

  const getStatusStyle = (status: string) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
    switch(status) {
      case 'Pending':
        return { ...baseStyle, backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fed7aa' };
      case 'In Progress':
        return { ...baseStyle, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
      case 'Completed':
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' };
      case 'Cancelled':
        return { ...baseStyle, backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
      default:
        return { ...baseStyle, backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Pending': return <Clock size={14} />;
      case 'In Progress': return <Wrench size={14} />;
      case 'Completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getPriorityStyle = (priority?: string) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid'
    };
    switch(priority) {
      case 'high':
        return { ...baseStyle, backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fed7aa' };
      case 'low':
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' };
      default:
        return { ...baseStyle, backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleExpandRequest = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getVehicleDetails = (vehicle: Vehicle) => {
    if (!vehicle) return "Unknown Vehicle";
    return `${vehicle.make} ${vehicle.model} (${vehicle.year}) ${vehicle.plate}`.trim();
  };

  const handleMechanicChange = (requestId: string, mechanicId: string | null) => {
    setSelectedMechanics(prev => ({ ...prev, [requestId]: mechanicId }));
  };

  const handleStatusChange = (requestId: string, status: string) => {
    setSelectedStatuses(prev => ({ ...prev, [requestId]: status }));
  };

  const handleAssign = async (requestId: string) => {
    console.log('Assigning service with ID:', requestId); // Add this log
    const mechanicId = selectedMechanics[requestId] || null;
    const status = selectedStatuses[requestId] 
      ?? requests.find(req => req.id === requestId)?.status 
      ?? "Pending";
    
    // Prevent action if no changes
    const currentRequest = requests.find(req => req.id === requestId);
    if (
      currentRequest?.mechanic?.id === mechanicId &&
      currentRequest?.status === status
    ) {
      return; // No changes to apply
    }

    setIsAssigning(prev => ({ ...prev, [requestId]: true }));
    try {
      await onAssign(requestId, mechanicId, status);
      // Clear selections after successful assign
      setSelectedMechanics(prev => ({ ...prev, [requestId]: null }));
      setSelectedStatuses(prev => ({ ...prev, [requestId]: status }));
    } catch (error) {
      console.error("Assignment failed:", error);
    } finally {
      setIsAssigning(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Prepare data for mechanic-centric table
  const mechanicAssignments = mechanics.map(mechanic => {
    const assignedServices = requests.filter(req => req.mechanic?.id === mechanic.id);
    return {
      mechanic,
      services: assignedServices.map(service => ({
        vehicle: getVehicleDetails(service.vehicle),
        date: formatDate(service.date),
        status: service.status,
      })),
    };
  });

  // Add mechanics with no assignments
  const allMechanicsData = [
    ...mechanicAssignments,
    ...mechanics
      .filter(mech => !mechanicAssignments.some(assignment => assignment.mechanic.id === mech.id))
      .map(mechanic => ({
        mechanic,
        services: [],
      })),
  ];

  if (showAllColumns) {
    // Mechanic-centric table for "Service Requests" tab
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead style={{
            backgroundColor: '#f8fafc'
          }}>
            <tr>
              <th style={{
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Mechanic</th>
              <th style={{
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Phone Number</th>
              <th style={{
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Assigned Vehicles</th>
              <th style={{
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Service Dates</th>
              <th style={{
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {allMechanicsData.map(({ mechanic, services }) => (
              <tr key={mechanic.id} style={{
                borderBottom: '1px solid #e2e8f0'
              }}>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {mechanic.username}
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {mechanic.phone || 'N/A'}
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {services.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {services.map((service, index) => (
                        <li key={index}>{service.vehicle}</li>
                      ))}
                    </ul>
                  ) : (
                    'None'
                  )}
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {services.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {services.map((service, index) => (
                        <li key={index}>{service.date}</li>
                      ))}
                    </ul>
                  ) : (
                    'None'
                  )}
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {services.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {services.map((service, index) => (
                        <li key={index}>
                          <span style={getStatusStyle(service.status)}>
                            {getStatusIcon(service.status)}
                            {service.status.toUpperCase()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'None'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Existing table for "Overview" tab
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
        <thead style={{
          backgroundColor: '#f8fafc'
        }}>
          <tr>
            <th style={{
              padding: '0.75rem 1.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Customer</th>
            <th style={{
              padding: '0.75rem 1.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Vehicle</th>
            <th style={{
              padding: '0.75rem 1.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Service</th>
            <th style={{
              padding: '0.75rem 1.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Status</th>
            <th style={{
              padding: '0.75rem 1.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <React.Fragment key={request.id}>
              <tr style={{
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
                onClick={() => toggleExpandRequest(request.id)}
              >
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UserIcon size={16} style={{ color: '#64748b' }} />
                    </div>
                    {request.vehicle.owner?.username || 'Unknown'}
                  </div>
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {getVehicleDetails(request.vehicle)}
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {request.description}
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  <span style={getStatusStyle(request.status)}>
                    {getStatusIcon(request.status)}
                    {request.status.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: isAssigning[request.id] ? '#93c5fd' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: isAssigning[request.id] ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (!isAssigning[request.id]) {
                          const target = e.currentTarget as HTMLButtonElement;
                          target.style.backgroundColor = '#1d4ed8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isAssigning[request.id]) {
                          const target = e.currentTarget as HTMLButtonElement;
                          target.style.backgroundColor = '#2563eb';
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssign(request.id);
                      }}
                      disabled={isAssigning[request.id]}
                    >
                      <span>{isAssigning[request.id] ? 'Assigning...' : 'Assign'}</span>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRequest === request.id && (
                <tr>
                  <td colSpan={5} style={{
                    padding: '0 1.5rem 1rem 1.5rem',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Service Details
                          </h4>
                          <p style={{ margin: 0 }}>{request.description}</p>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Priority
                          </h4>
                          <span style={getPriorityStyle(request.priority)}>
                            {(request.priority || 'none').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Scheduled Date
                          </h4>
                          <p style={{ margin: 0 }}>{formatDate(request.date)}</p>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                          Customer Information
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UserIcon size={14} style={{ color: '#64748b' }} />
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1a202c' }}>
                              {request.vehicle.owner?.username || 'Unknown'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} style={{ color: '#64748b' }} />
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1a202c' }}>
                              {request.vehicle.owner?.email || 'N/A'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={14} style={{ color: '#64748b' }} />
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1a202c' }}>
                              {request.vehicle.owner?.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Assign Mechanic
                          </h4>
                          <select
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #e2e8f0',
                              backgroundColor: 'white'
                            }}
                            value={selectedMechanics[request.id] || request.mechanic?.id || ''}
                            onChange={(e) => handleMechanicChange(request.id, e.target.value || null)}
                          >
                            <option value="">Select Mechanic</option>
                            {mechanics.map(mechanic => (
                              <option key={mechanic.id} value={mechanic.id}>{mechanic.username}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Update Status
                          </h4>
                          <select
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #e2e8f0',
                              backgroundColor: 'white'
                            }}
                            value={selectedStatuses[request.id] || request.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {request.mechanic && (
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Assigned Mechanic
                          </h4>
                          <p style={{ margin: 0 }}>
                            {request.mechanic.username || 'Unknown'}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceRequestsTable;
