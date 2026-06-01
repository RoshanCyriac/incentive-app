import React from 'react';

/**
 * Sidebar layout component
 */
export default function Sidebar({ isOpen, items, activeItem, onItemClick, userSection, onToggle }) {
  return (
    <div
      style={{
        width: isOpen ? '240px' : '80px',
        transition: 'width 300ms',
        borderRightColor: '#EB0A1E',
      }}
      className="bg-charcoal text-white flex flex-col h-screen border-r-4"
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: '#EB0A1E' }}
            className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-white text-sm"
          >
            T
          </div>
          {isOpen && (
            <div>
              <p className="font-semibold text-sm text-white">Toyota</p>
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-150"
            style={
              activeItem === item.id
                ? {
                    backgroundColor: '#EB0A1E',
                    color: 'white',
                    borderLeft: '4px solid white',
                  }
                : {
                    color: '#D1D5DB',
                  }
            }
            onMouseEnter={(e) => {
              if (activeItem !== item.id) {
                e.target.style.backgroundColor = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeItem !== item.id) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
            title={!isOpen ? item.label : ''}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
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
