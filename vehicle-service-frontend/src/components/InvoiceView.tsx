// components/InvoiceView.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
//import { Receipt } from "lucide-react";
import { getInvoices } from "../utils/apiClient";

interface Invoice {
  id: string;
  serviceId: string;
  vehicleId: string;
  userId: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  laborCost: number;
  partsCost: number;
  tax: number;
  totalAmount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    description: string;
    status: string;
    date: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: string;
    plate: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
  try {
    if (!id) throw new Error("No invoice ID provided");
    const data = await getInvoices(id);
    if (data.length === 0) {
      throw new Error("Invoice not found");
    }
    setInvoice(data[0]); // Take the first invoice from the array
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
    // const fetchInvoice = async () => {
    //   try {
    //     if (!id) throw new Error("No invoice ID provided");
    //     const data = await getInvoices(id);
    //     setInvoice(data);
    //   } catch (err: any) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    fetchInvoice();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusStyle = (status: string) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      display: 'inline-block'
    };
    switch(status) {
      case 'Draft':
        return { ...baseStyle, backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
      case 'Sent':
        return { ...baseStyle, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
      case 'Paid':
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' };
      case 'Overdue':
        return { ...baseStyle, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
      default:
        return baseStyle;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Invoice #{invoice.id.slice(0, 8)}
          </h2>
          <span style={getStatusStyle(invoice.status)}>
            {invoice.status.toUpperCase()}
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Customer
          </h3>
          <p>{invoice.user?.username || 'N/A'}</p>
          <p>{invoice.user?.email || 'N/A'}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Vehicle
          </h3>
          <p>{invoice.vehicle ? `${invoice.vehicle.make} ${invoice.vehicle.model} (${invoice.vehicle.plate})` : 'N/A'}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Details
          </h3>
          <p>Created: {formatDate(invoice.createdAt)}</p>
          {invoice.sentAt && <p>Sent: {formatDate(invoice.sentAt)}</p>}
          <p>Service: {invoice.service?.description || 'N/A'}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Invoice Items
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Description</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Quantity</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Unit Price</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.description}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>${item.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p>Labor Cost: ${invoice.laborCost.toFixed(2)}</p>
          <p>Parts Cost: ${invoice.partsCost.toFixed(2)}</p>
          <p>Tax: ${invoice.tax.toFixed(2)}</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>
            Total: ${invoice.totalAmount.toFixed(2)}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;