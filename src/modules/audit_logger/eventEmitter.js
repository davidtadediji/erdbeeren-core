// src/modules/audit_logger/eventEmitter.js

import EventEmitter from 'events';

class AuditEventEmitter extends EventEmitter {}

const auditEventEmitter = new AuditEventEmitter();

export default auditEventEmitter;
