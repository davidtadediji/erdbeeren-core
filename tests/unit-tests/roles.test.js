// roles.test.js
import { ROLES, ROLE_PERMISSIONS } from '../../src/modules/authentication/config/roles.js';

describe('Roles Configuration', () => {
  it('should define roles with their respective permissions', () => {
    expect(ROLES).toHaveProperty('ADMIN');
    expect(ROLES).toHaveProperty('MONITOR');
    expect(ROLES).toHaveProperty('AGENT');
    expect(ROLE_PERMISSIONS.ADMIN).toEqual(expect.arrayContaining(['viewProfile', 'manageUsers', 'manageSettings', 'viewAdminDashboard']));
    expect(ROLE_PERMISSIONS.MONITOR).toEqual(expect.arrayContaining(['viewProfile', 'viewMonitorDashboard', 'viewReports']));
    expect(ROLE_PERMISSIONS.AGENT).toEqual(expect.arrayContaining(['viewProfile', 'viewAgentDashboard', 'submitRequests']));
  });

  // Add more tests for other functionality in roles.js
});
