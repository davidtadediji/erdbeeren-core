// src\modules\authentication\config\roles.js
const ROLES = {
  ADMIN: "admin",
  MONITOR: "monitor",
  AGENT: "agent",
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "manageUsers",
    "manageConfiguration",
    "manageLLM",
    "broadcastMessage",
    "viewAdminDashboard",
    "viewMonitorDashboard",
    "viewReports",
    "submitRequests",
    "sendMessage",
    "viewAuditLogs"
  ],
  [ROLES.MONITOR]: ["viewReports", "viewAuditLogs", "viewMonitorDashboard"],
  [ROLES.AGENT]: [ "submitRequests", "viewAgentDashboard", "sendMessage"],
};

export { ROLES, ROLE_PERMISSIONS };
