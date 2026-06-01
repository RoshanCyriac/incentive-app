import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components';
import {
  IconLayoutGrid,
  IconCar,
  IconBarChart,
  IconUsers,
  IconSettings,
  IconLogOut,
} from '../components/icons';
import {
  getUserDisplayName,
  getUserInitials,
  formatRoleLabel,
} from '../utils/userDisplay';
import CarInventoryTab from './admin/CarInventoryTab';
import SlabEngineTab from './admin/SlabEngineTab';
import OfficersTab from './admin/OfficersTab';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: IconLayoutGrid },
  { id: 'cars', label: 'Car Inventory', icon: IconCar },
  { id: 'slabs', label: 'Incentive Slabs', icon: IconBarChart },
  { id: 'officers', label: 'Sales Officers', icon: IconUsers },
  { id: 'settings', label: 'Settings', icon: IconSettings },
];

const TAB_HEADERS = {
  dashboard: { title: 'Dashboard', breadcrumb: 'Admin → Dashboard' },
  cars: { title: 'Car Inventory', breadcrumb: 'Admin → Car Inventory', icon: IconCar },
  slabs: { title: 'Incentive Slabs', breadcrumb: 'Admin → Incentive Slabs', icon: IconBarChart },
  officers: { title: 'Sales Officers', breadcrumb: 'Admin → Sales Officers', icon: IconUsers },
  settings: { title: 'Settings', breadcrumb: 'Admin → Settings', icon: IconSettings },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('cars');

  const displayName = getUserDisplayName(user);
  const roleLabel = formatRoleLabel(user?.role);
  const headerMeta = TAB_HEADERS[activeTab] || TAB_HEADERS.cars;
  const TitleIcon = headerMeta.icon;

  const userSection = (
    <div
      className="flex items-center gap-2.5"
      style={{ padding: '12px 16px' }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-full text-white"
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#EB0A1E',
          fontSize: '11px',
          fontWeight: 500,
        }}
      >
        {getUserInitials(displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-white truncate leading-tight"
          style={{ fontSize: '12.5px', fontWeight: 500 }}
        >
          {displayName}
        </p>
        <p
          className="truncate leading-tight"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
        >
          {roleLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={logout}
        className="shrink-0 flex items-center justify-center transition-colors"
        style={{
          border: '0.5px solid rgba(255,255,255,0.2)',
          borderRadius: '5px',
          padding: '5px 8px',
          color: 'rgba(255,255,255,0.5)',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
        aria-label="Log out"
      >
        <IconLogOut size={14} />
      </button>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'cars') return <CarInventoryTab />;
    if (activeTab === 'slabs') return <SlabEngineTab />;
    if (activeTab === 'officers') return <OfficersTab />;
    return (
      <div
        className="bg-white flex items-center justify-center px-4 text-center"
        style={{
          border: '0.5px solid #E5E5E5',
          borderRadius: '10px',
          minHeight: '200px',
          color: '#999',
          fontSize: '13px',
        }}
      >
        {TAB_HEADERS[activeTab]?.title} — coming soon
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      activeItem={activeTab}
      onItemClick={setActiveTab}
      userSection={userSection}
      headerTitle={headerMeta.title}
      headerTitleIcon={TitleIcon ? <TitleIcon size={18} /> : null}
      headerBreadcrumb={headerMeta.breadcrumb}
      welcomeName={displayName}
      roleBadge={roleLabel}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
