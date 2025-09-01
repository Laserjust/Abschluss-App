import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard component for role-based access control
 * @param {Object} props
 * @param {string|string[]} props.allowedRoles - Single role or array of allowed roles
 * @param {string} props.permission - Specific permission to check
 * @param {React.ReactNode} props.children - Content to render if access is granted
 * @param {React.ReactNode} props.fallback - Content to render if access is denied
 */
export function RoleGuard({ allowedRoles, permission, children, fallback = null }) {
  const { currentUser, hasRole, hasPermission } = useAuth();

  // If no user is logged in, deny access
  if (!currentUser) {
    return fallback;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Check roles if specified
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasAllowedRole = roles.some(role => hasRole(role));
    
    if (!hasAllowedRole) {
      return fallback;
    }
  }

  return children;
}

/**
 * Higher-order component for role-based access control
 */
export function withRoleGuard(Component, allowedRoles, permission) {
  return function GuardedComponent(props) {
    return (
      <RoleGuard 
        allowedRoles={allowedRoles} 
        permission={permission}
        fallback={<div className="access-denied">Zugriff verweigert</div>}
      >
        <Component {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Hook for conditional rendering based on roles
 */
export function useRoleAccess() {
  const { currentUser, hasRole, hasPermission } = useAuth();

  const canAccess = (roles, permission) => {
    if (!currentUser) return false;
    
    if (permission && !hasPermission(permission)) return false;
    
    if (roles) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.some(role => hasRole(role));
    }
    
    return true;
  };

  return {
    canAccess,
    isAdmin: hasRole('admin'),
    isTeacher: hasRole('teacher'),
    isStudent: hasRole('student'),
    currentRole: currentUser?.role
  };
}
