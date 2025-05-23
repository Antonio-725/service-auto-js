// components/StatsCards.js
import React from "react";

const StatsCards = ({ stats }) => {
  const getIconStyle = (color) => {
    const baseStyle = {
      padding: '0.75rem',
      borderRadius: '0.5rem'
    };
    
    switch(color) {
      case 'blue':
        return { ...baseStyle, backgroundColor: '#eff6ff', color: '#2563eb' };
      case 'orange':
        return { ...baseStyle, backgroundColor: '#fff7ed', color: '#ea580c' };
      case 'yellow':
        return { ...baseStyle, backgroundColor: '#fefce8', color: '#ca8a04' };
      case 'green':
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#16a34a' };
      case 'purple':
        return { ...baseStyle, backgroundColor: '#faf5ff', color: '#9333ea' };
      default:
        return { ...baseStyle, backgroundColor: '#f8fafc', color: '#64748b' };
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {stats.map((stat, index) => (
        <div key={index} style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#64748b',
              margin: 0
            }}>{stat.title}</p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1a202c',
              margin: '0.5rem 0'
            }}>{stat.value}</p>
            <p style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: 0
            }}>{stat.change} from last month</p>
          </div>
          <div style={getIconStyle(stat.color)}>
            <stat.icon size={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;