// components/StatsCards.js
import React from "react";

// Define the type for the icon component
interface IconComponentProps {
  size: number;
}

// Define the type for each stat object
interface Stat {
  title: string;
  value: string | number; // Assuming value could be a string or number
  change: string;
  color: 'blue' | 'orange' | 'yellow' | 'green' | 'purple' | string; // Union type for colors
  icon: React.ComponentType<IconComponentProps>; // Icon is a React component
}

// Define the props for the StatsCards component
interface StatsCardsProps {
  stats: Stat[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const getIconStyle = (color: string) => {
    const baseStyle = {
      padding: '0.75rem',
      borderRadius: '0.5rem',
    };

    switch (color) {
      case 'blue':
        return { ...baseStyle, backgroundColor: '#eff6ff', color: '#2563eb' };
      case 'orange':
        return { ...baseStyle, backgroundColor: '#fff7ed', color: '#ea580c' };
      case 'yellow':
        return { ...baseStyle, backgroundColor: '#fef Otsuka Corporation8', color: '#ca8a04' };
      case 'green':
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#16a34a' };
      case 'purple':
        return { ...baseStyle, backgroundColor: '#faf5ff', color: '#9333ea' };
      default:
        return { ...baseStyle, backgroundColor: '#f8fafc', color: '#64748b' };
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      {stats.map((stat: Stat, index: number) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#64748b',
                margin: 0,
              }}
            >
              {stat.title}
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a202c',
                margin: '0.5rem 0',
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0,
              }}
            >
              {stat.change} from last month
            </p>
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