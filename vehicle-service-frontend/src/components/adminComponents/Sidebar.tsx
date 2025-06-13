{/* src/components/sidebar/Sidebar.tsx */}
import React from 'react';
import { BarChart3, Settings, FileText, Package, Truck } from 'lucide-react';
import styles from '../adminComponents/styles/styles.module.css';
import type { LucideIcon } from 'lucide-react';

// Types
interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Constants
const NAV_ITEMS: NavigationItem[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "services", label: "Service Requests", icon: Settings },
  { id: "spare-parts", label: "Spare Parts", icon: Package },
  { id: "spare-part-requests", label: "Spare Part Requests", icon: Truck },
  { id: "reports", label: "Reports", icon: FileText },
];

// NavItem Component
const NavItem: React.FC<{
  item: NavigationItem;
  activeTab: string;
  setActiveTab: (id: string) => void;
}> = ({ item, activeTab, setActiveTab }) => {
  const Icon = item.icon;
  return (
    <li>
      <button
        onClick={() => setActiveTab(item.id)}
        className={`${styles.navButton} ${activeTab === item.id ? styles.navButtonActive : ''}`}
        onMouseEnter={(e) => {
          if (activeTab !== item.id) {
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }
        }}
        onMouseLeave={(e) => {
          if (activeTab !== item.id) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </button>
    </li>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  activeTab: string;
  setActiveTab: (id: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;