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
    { id: 'officers', label: 'Officers', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
              IC
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-sm">Incentive</p>
                <p className="text-xs text-gray-400">Calculator</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="text-gray-400 text-xs">Logged in as</p>
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium"
          >
            {sidebarOpen ? 'Logout' : '←'}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <div className="p-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 hover:bg-gray-800 rounded-lg transition"
          >
            {sidebarOpen ? '◄' : '►'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {navItems.find((item) => item.id === activeTab)?.label}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your incentive program
          </p>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'cars' && <CarInventoryTab />}
            {activeTab === 'slabs' && <SlabEngineTab />}
            {activeTab === 'officers' && <OfficersTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
