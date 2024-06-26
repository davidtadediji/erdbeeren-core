// src\modules\audit_logger\eventListener.js
import logger from "../../../logger.js";
import auditEventEmitter from "./eventEmitter.js";
import { produceAuditEvent } from "./messageQueue.js";

auditEventEmitter.on("auditTrail", ({ userId, actionType, details, date }) => {
  logger.info("Audit event triggered!");

  produceAuditEvent("logEvent", { userId, actionType, details, date });
});
