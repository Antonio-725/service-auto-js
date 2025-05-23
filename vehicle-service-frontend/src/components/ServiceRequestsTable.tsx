// components/ServiceRequestsTable.js
import React, { useState } from "react";
import { 
  Clock,
  Wrench,
  CheckCircle,
  ChevronDown,
  User
} from "lucide-react";

const ServiceRequestsTable = ({ 
  requests, 
  mechanics, 
  onAssignMechanic, 
  onStatusChange,
  showAllColumns = false 
}) => {
  const [expandedRequest, setExpandedRequest] = useState(null);

  const getStatusStyle = (status) => {
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
      case 'pending':
        return { 
          ...baseStyle, 
          backgroundColor: '#fffbeb', 
          color: '#d97706', 
          border: '1px solid #fed7aa' 
        };
      case 'in-progress':
        return { 
          ...baseStyle, 
          backgroundColor: '#eff6ff', 
          color: '#2563eb', 
          border: '1px solid #bfdbfe' 
        };
      case 'completed':
        return { 
          ...baseStyle, 
          backgroundColor: '#f0fdf4', 
          color: '#16a34a', 
          border: '1px solid #bbf7d0' 
        };
      default:
        return { 
          ...baseStyle, 
          backgroundColor: '#f8fafc', 
          color: '#64748b', 
          border: '1px solid #e2e8f0' 
        };
    }
  };

  const getPriorityStyle = (priority) => {
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={14} />;
      case 'in-progress': return <Wrench size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleExpandRequest = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

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
            {showAllColumns && (
              <>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Date</th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Priority</th>
              </>
            )}
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
                      <User size={16} style={{ color: '#64748b' }} />
                    </div>
                    {request.customer}
                  </div>
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})
                </td>
                <td style={{
                  padding: '1rem 1.5rem',
                  fontSize: '0.875rem',
                  color: '#1a202c'
                }}>
                  {request.service}
                </td>
                {showAllColumns && (
                  <>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: '#1a202c'
                    }}>
                      {formatDate(request.date)}
                    </td>
                    <td style={{
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: '#1a202c'
                    }}>
                      <span style={getPriorityStyle(request.priority)}>
                        {request.priority.toUpperCase()}
                      </span>
                    </td>
                  </>
                )}
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
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle action
                      }}
                    >
                      <span>Assign</span>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRequest === request.id && (
                <tr>
                  <td colSpan={showAllColumns ? 6 : 4} style={{
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
                          <p style={{ margin: 0 }}>{request.service}</p>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Priority
                          </h4>
                          <span style={getPriorityStyle(request.priority)}>
                            {request.priority.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Scheduled Date
                          </h4>
                          <p style={{ margin: 0 }}>{formatDate(request.date)}</p>
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
                            value={request.assignedMechanic || ''}
                            onChange={(e) => onAssignMechanic(request.id, e.target.value)}
                          >
                            <option value="">Select Mechanic</option>
                            {mechanics.map(mechanic => (
                              <option key={mechanic.id} value={mechanic.id}>{mechanic.name}</option>
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
                            value={request.status}
                            onChange={(e) => onStatusChange(request.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      {request.assignedMechanic && (
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                            Assigned Mechanic
                          </h4>
                          <p style={{ margin: 0 }}>
                            {mechanics.find(m => m.id === request.assignedMechanic)?.name || 'Unknown'}
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