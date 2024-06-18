// src\modules\audit_logger\eventListener.js
import auditEventEmitter from "./eventEmitter.js";
import { produceAuditEvent } from "./messageQueue.js";

auditEventEmitter.on("action", (message) => {
  produceAuditEvent(
    "auditTrailQueue",
    {
      userId,
      actionType: "update",
      entityName: "User",
      entityId: userId.toString(),
      details: {
        oldValue,
        newValue,
      },
    },
    message
  );
});
