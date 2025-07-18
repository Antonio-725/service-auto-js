import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../../utils/apiClient";
import { Receipt } from "lucide-react";
import type  { CSSProperties } from "react";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  sentAt: string | null; 
  items: InvoiceItem[];
  service?: {
    description: string;
    date: string;
  };
  vehicle?: {
    plate: string;
  };
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [token, userId, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status: string): CSSProperties => {
    const baseStyle: CSSProperties = {
      padding: '0.375rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'inline-block',
      textTransform: 'uppercase' as const, // Explicitly type as TextTransform
    };
    switch (status) {
      case 'Sent':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'Paid':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
      case 'Overdue':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
      default:
        return baseStyle;
    }
  };

  const formatCurrency = (value: number | string | undefined): string => {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeModal = () => {
    setSelectedInvoice(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        My Payments
      </h2>
      {invoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase' as const,
                }}>Service</th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase' as const,
                }}>Vehicle</th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase' as const,
                }}>Date</th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase' as const,
                }}>Status</th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase' as const,
                }}>Total Amount</th>
                <th style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#64748b',
                  textTransform: 'uppercase' as const,
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    {invoice.service?.description || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    {invoice.vehicle?.plate || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <span style={getStatusStyle(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    KES {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onClick={() => handleViewInvoice(invoice)}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                      <Receipt size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '2.5rem',
              borderRadius: '1rem',
              maxWidth: '800px',
              width: '95%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
              margin: '1rem',
            }}
          >
            <button
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#64748b',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onClick={closeModal}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              ×
            </button>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>
                  Invoice #{selectedInvoice.id.slice(0, 8)}
                </h2>
                <span style={getStatusStyle(selectedInvoice.status)}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.75rem' }}>
                  Details
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                  Service: {selectedInvoice.service?.description || 'N/A'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                  Vehicle Plate: {selectedInvoice.vehicle?.plate || 'N/A'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                  Created: {formatDate(selectedInvoice.createdAt)}
                </p>
                {selectedInvoice.sentAt && (
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
                    Sent: {formatDate(selectedInvoice.sentAt)}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Invoice Items
                </h3>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        Description
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        Quantity
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        Unit Price
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: '#ffffff',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                      >
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569', borderTop: '1px solid #e5e7eb' }}>
                          {item.description}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#475569', borderTop: '1px solid #e5e7eb' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#475569', borderTop: '1px solid #e5e7eb' }}>
                          KES {formatCurrency(item.unitPrice)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#475569', borderTop: '1px solid #e5e7eb' }}>
                          KES {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ textAlign: 'right', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                  Total: KES {formatCurrency(selectedInvoice.totalAmount)}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem' }}>
                  Status: <span style={getStatusStyle(selectedInvoice.status)}>{selectedInvoice.status.toUpperCase()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PaymentsPage;
