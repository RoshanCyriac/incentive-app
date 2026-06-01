import React from 'react';

/**
 * Sidebar layout component
 */
export default function Sidebar({ isOpen, items, activeItem, onItemClick, userSection, onToggle }) {
  return (
    <div
      className={`${
        isOpen ? 'w-60' : 'w-20'
      } bg-charcoal text-white transition-all duration-300 flex flex-col h-screen border-r-4 border-toyota-red sticky top-0`}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-toyota-red rounded-md flex items-center justify-center font-header text-white text-sm font-bold">
            T
          </div>
          {isOpen && (
            <div>
              <p className="font-header text-sm text-white">Toyota</p>
              <p className="text-xs text-gray-300">Incentive</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-150 ${
              activeItem === item.id
                ? 'bg-toyota-red text-white border-l-4 border-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
            title={!isOpen ? item.label : ''}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="text-sm font-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Section */}
      {userSection && (
        <div className="p-4 border-t border-gray-700 space-y-3">
          {isOpen && userSection}
        </div>
      )}

      {/* Toggle Sidebar */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={onToggle}
          className="w-full p-2 hover:bg-gray-800 rounded-md transition text-white text-center"
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? '◄' : '►'}
        </button>
      </div>
    </div>
  );
}
