import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components';
import {
  IconLayoutGrid,
  IconCar,
  IconBarChart,
  IconUsers,
  IconSettings,
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

  const renderContent = () => {
    if (activeTab === 'cars') return <CarInventoryTab />;
    if (activeTab === 'slabs') return <SlabEngineTab />;
    if (activeTab === 'officers') return <OfficersTab />;
    return (
      <div className="bg-white flex items-center justify-center px-4 text-center rounded-xl border border-[#E5E5E5] min-h-[200px] text-[#999] text-sm">
        {TAB_HEADERS[activeTab]?.title} — coming soon
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      activeItem={activeTab}
      onItemClick={setActiveTab}
      userName={displayName}
      userRole={roleLabel}
      userInitials={getUserInitials(displayName)}
      onLogout={logout}
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
