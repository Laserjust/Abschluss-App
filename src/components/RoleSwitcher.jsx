import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import yearManagementService from '../services/yearManagementService';
// Check if we're in demo mode
const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true;
};

export function RoleSwitcher() {
  const { currentUser, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Check if user is an admin account (by email pattern)
  const isAdminAccount = () => {
    if (!currentUser) return false;
    
    // Check if this is an admin account by email pattern
    const currentYear = yearManagementService.getCurrentYear();
    const adminEmails = [
      `admin@rse-abschluss${currentYear}.de`,
      `admin@rse-abschluss${currentYear + 1}.de`,
      `admin@rse-abschluss${currentYear - 1}.de`
    ];
    
    return adminEmails.includes(currentUser.email);
  };

  // Only show for admin accounts in demo mode
  if (!isDemoMode() || !currentUser || !isAdminAccount()) {
    return null;
  }

  const roles = [
    { value: 'student', label: 'Schüler', icon: '🎓' },
    { value: 'teacher', label: 'Lehrer', icon: '👨‍🏫' },
    { value: 'admin', label: 'Admin', icon: '👑' }
  ];

  const currentRole = roles.find(role => role.value === currentUser.role);

  const handleRoleSwitch = (newRole) => {
    switchDemoRole(newRole);
    setIsOpen(false);
  };

  return (
    <div className="role-switcher">
      <button 
        className="role-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Demo-Rolle wechseln"
      >
        <span className="role-icon">{currentRole?.icon}</span>
        <span className="role-label">{currentRole?.label}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="role-dropdown">
          <div className="role-dropdown-header">
            <strong>Demo-Rolle wechseln</strong>
          </div>
          {roles.map(role => (
            <button
              key={role.value}
              className={`role-option ${currentUser.role === role.value ? 'active' : ''}`}
              onClick={() => handleRoleSwitch(role.value)}
              disabled={currentUser.role === role.value}
            >
              <span className="role-icon">{role.icon}</span>
              <span className="role-label">{role.label}</span>
              {currentUser.role === role.value && (
                <span className="current-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
      
      <style jsx="true">{`
        .role-switcher {
          position: relative;
          display: inline-block;
        }
        
        .role-switcher-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--primary-color, #007AFF);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .role-switcher-button:hover {
          background: var(--primary-dark, #0056CC);
          transform: translateY(-1px);
        }
        
        .role-icon {
          font-size: 16px;
        }
        
        .dropdown-arrow {
          font-size: 12px;
          transition: transform 0.2s ease;
        }
        
        .role-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
          margin-top: 4px;
        }
        
        .role-dropdown-header {
          padding: 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
        
        .role-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .role-option:hover:not(:disabled) {
          background: #f0f0f0;
        }
        
        .role-option:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .role-option.active {
          background: #e3f2fd;
          color: var(--primary-color, #007AFF);
        }
        
        .current-indicator {
          margin-left: auto;
          color: var(--success-color, #28a745);
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .role-switcher-button {
            padding: 6px 10px;
            font-size: 12px;
          }
          
          .role-dropdown {
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}
