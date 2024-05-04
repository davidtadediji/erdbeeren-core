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
    "viewAgentDashboard",
    "submitRequests",
    "sendMessage"
  ],
  [ROLES.MONITOR]: ["viewReports", "viewMonitorDashboard"],
  [ROLES.AGENT]: [ "submitRequests", "viewAgentDashboard", "sendMessage"],
};

export { ROLES, ROLE_PERMISSIONS };
