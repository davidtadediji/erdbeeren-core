// src\modules\authentication\config\roles.js
const ROLES = {
    ADMIN: 'admin',
    MONITOR: 'monitor',
    AGENT: 'agent',
  };
  
  const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['viewProfile', 'manageUsers', 'manageSettings', 'viewAdminDashboard'],
    [ROLES.MONITOR]: ['viewProfile','viewMonitorDashboard', 'viewReports'],
    [ROLES.AGENT]: ['viewProfile','viewAgentDashboard', 'submitRequests'],
  };
  
  export { ROLES, ROLE_PERMISSIONS };
  