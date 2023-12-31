// src\modules\authentication\config\roles.js
const ROLES = {
    ADMIN: 'admin',
    MONITOR: 'monitor',
    AGENT: 'agent',
  };
  
  const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['manageUsers', 'manageConfiguration', 'viewAdminDashboard'],
    [ROLES.MONITOR]: ['viewMonitorDashboard', 'viewReports'],
    [ROLES.AGENT]: ['viewAgentDashboard', 'submitRequests'],
  };
  
  export { ROLES, ROLE_PERMISSIONS };
  