// AdminDashboard.js
import React, { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Wrench,
  ChevronDown
} from "lucide-react";
import ServiceRequestsTable from "../components/ServiceRequestsTable";
import StatsCards from "../components/StatsCards";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [serviceRequests, setServiceRequests] = useState([
    { 
      id: 1, 
      customer: "John Smith", 
      vehicle: { make: "BMW", model: "X5", year: "2020" }, 
      service: "Oil Change", 
      date: new Date(), 
      priority: "high",
      status: "pending",
      assignedMechanic: null
    },
    { 
      id: 2, 
      customer: "Sarah Johnson", 
      vehicle: { make: "Audi", model: "A4", year: "2019" }, 
      service: "Brake Repair", 
      date: new Date(new Date().setDate(new Date().getDate() + 1)), 
      priority: "medium",
      status: "pending",
      assignedMechanic: null
    },
    { 
      id: 3, 
      customer: "Mike Brown", 
      vehicle: { make: "Tesla", model: "Model 3", year: "2022" }, 
      service: "Inspection", 
      date: new Date("2023-12-24"), 
      priority: "low",
      status: "pending",
      assignedMechanic: null
    }
  ]);

  const mechanics = [
    { id: 1, name: "Alex Johnson" },
    { id: 2, name: "Sam Wilson" },
    { id: 3, name: "Taylor Smith" }
  ];

  const stats = [
    { title: "Total Services", value: "2,847", change: "+12%", icon: Settings, color: "blue" },
    { title: "Pending", value: "23", change: "-8%", icon: Clock, color: "orange" },
    { title: "In Progress", value: "15", change: "+5%", icon: Wrench, color: "yellow" },
    { title: "Completed Today", value: "18", change: "+24%", icon: CheckCircle, color: "green" },
    { title: "Revenue", value: "$12,450", change: "+18%", icon: TrendingUp, color: "purple" }
  ];

  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "services", label: "Service Requests", icon: Settings },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  const handleAssignMechanic = (requestId, mechanicId) => {
    setServiceRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, assignedMechanic: mechanicId, status: "in-progress" } 
          : request
      )
    );
  };

  const handleStatusChange = (requestId, newStatus) => {
    setServiceRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus } 
          : request
      )
    );
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1a202c',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    dateInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#64748b'
    },
    avatar: {
      width: '2rem',
      height: '2rem',
      backgroundColor: '#cbd5e0',
      borderRadius: '50%'
    },
    mainLayout: {
      display: 'flex'
    },
    sidebar: {
      width: '16rem',
      backgroundColor: 'white',
      borderRight: '1px solid #e2e8f0',
      minHeight: '100vh'
    },
    sidebarContent: {
      padding: '1.5rem'
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    navButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#64748b',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      textAlign: 'left'
    },
    navButtonActive: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      borderColor: '#93c5fd'
    },
    mainContent: {
      flex: 1,
      padding: '2rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0'
    },
    cardHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1a202c',
      margin: 0
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <p style={styles.headerSubtitle}>Manage your automotive services</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.dateInfo}>
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div style={styles.avatar}></div>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <nav style={styles.sidebar}>
          <div style={styles.sidebarContent}>
            <ul style={styles.navList}>
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      ...styles.navButton,
                      ...(activeTab === item.id ? styles.navButtonActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== item.id) {
                        e.target.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== item.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {activeTab === "overview" && (
            <div>
              <StatsCards stats={stats} />
              
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Service Requests</h2>
                </div>
                <ServiceRequestsTable 
                  requests={serviceRequests} 
                  mechanics={mechanics}
                  onAssignMechanic={handleAssignMechanic}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <h2 style={styles.cardTitle}>All Service Requests</h2>
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
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    <span>New Request</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <ServiceRequestsTable 
                requests={serviceRequests} 
                mechanics={mechanics}
                onAssignMechanic={handleAssignMechanic}
                onStatusChange={handleStatusChange}
                showAllColumns={true}
              />
            </div>
          )}

          {activeTab === "reports" && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Performance Metrics</h2>
                </div>
                <div style={{padding: '1.5rem'}}>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <span style={{fontSize: '0.875rem', color: '#64748b'}}>Service Completion Rate</span>
                        <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#1a202c'}}>94%</span>
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
                          width: '94%',
                          backgroundColor: '#16a34a'
                        }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <span style={{fontSize: '0.875rem', color: '#64748b'}}>Customer Satisfaction</span>
                        <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#1a202c'}}>4.8/5</span>
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
                          width: '96%',
                          backgroundColor: '#2563eb'
                        }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <h2 style={styles.cardTitle}>Monthly Reports</h2>
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
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
                <div style={{padding: '1.5rem'}}>
                  <div style={{textAlign: 'center', padding: '3rem 0', color: '#64748b'}}>
                    <FileText size={48} style={{margin: '0 auto 1rem', color: '#cbd5e0'}} />
                    <p style={{margin: '0 0 0.5rem 0'}}>No reports generated yet</p>
                    <p style={{fontSize: '0.875rem', margin: 0}}>Click the button above to create your first report</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;