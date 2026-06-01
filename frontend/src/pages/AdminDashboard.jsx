import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components';
import { IconCar, IconBarChart, IconUsers } from '../components/icons';
import {
  getUserDisplayName,
  getUserInitials,
  formatRoleLabel,
} from '../utils/userDisplay';
import CarInventoryTab from './admin/CarInventoryTab';
import SlabEngineTab from './admin/SlabEngineTab';
import OfficersTab from './admin/OfficersTab';

const NAV_ITEMS = [
  { id: 'cars', label: 'Car Inventory', shortLabel: 'Cars', icon: IconCar },
  { id: 'slabs', label: 'Incentive Slabs', shortLabel: 'Slabs', icon: IconBarChart },
  { id: 'officers', label: 'Sales Officers', shortLabel: 'Team', icon: IconUsers },
];

const TAB_HEADERS = {
  cars: { title: 'Car Inventory', breadcrumb: 'Admin → Car Inventory', icon: IconCar },
  slabs: { title: 'Incentive Slabs', breadcrumb: 'Admin → Incentive Slabs', icon: IconBarChart },
  officers: { title: 'Sales Officers', breadcrumb: 'Admin → Sales Officers', icon: IconUsers },
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
    return <CarInventoryTab />;
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
      headerTitleIcon={TitleIcon ? <TitleIcon size={16} /> : null}
      headerBreadcrumb={headerMeta.breadcrumb}
      welcomeName={displayName}
      roleBadge={roleLabel}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
