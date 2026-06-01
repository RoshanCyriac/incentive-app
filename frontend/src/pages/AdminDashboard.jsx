import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getCars,
  createCar,
  updateCar,
  deleteCar,
  getSlabs,
  createSlab,
  updateSlab,
  deleteSlab,
  getUsers,
  createUser,
} from '../api/client';
import { Sidebar, Header, Button } from '../components';
import CarInventoryTab from './admin/CarInventoryTab';
import SlabEngineTab from './admin/SlabEngineTab';
import OfficersTab from './admin/OfficersTab';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('cars');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'cars', label: 'Car Inventory', icon: '🚗' },
    { id: 'slabs', label: 'Slab Engine', icon: '📊' },
    { id: 'officers', label: 'Sales Officers', icon: '👥' },
  ];

  const tabLabel = navItems.find((item) => item.id === activeTab)?.label;

  const userSection = (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-toyota-red rounded-full flex items-center justify-center text-white font-header">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-label text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-300 capitalize">{user?.role || 'Administrator'}</p>
        </div>
      </div>
      <Button
        onClick={logout}
        variant="secondary"
        size="sm"
        className="w-full text-xs"
      >
        Logout
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen bg-off-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        items={navItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        userSection={userSection}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={tabLabel}
          rightContent={
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Welcome back, {user?.name}</span>
              <div className="w-10 h-10 bg-toyota-red rounded-full flex items-center justify-center text-white font-header text-sm cursor-pointer hover:bg-red-700 transition-colors">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          }
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'cars' && <CarInventoryTab />}
            {activeTab === 'slabs' && <SlabEngineTab />}
            {activeTab === 'officers' && <OfficersTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
