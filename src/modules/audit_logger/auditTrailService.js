import logger from "../../../logger.js";



export async function handleAuditEvent(event) {

    logger.info("Handle Audit Event Triggered!")  
    try {
      // Extract relevant data from the event
      const { userId, actionType, entityName, entityId, details } = event;
  
      // Find the user associated with the audit event
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        logger.error(`User with ID ${userId} not found.`);
        return;
      }
  
      // Create the audit log in the database
      const auditLog = await prisma.auditLog.create({
        data: {
          user: { connect: { id: userId } },
          actionType,
          entityName,
          entityId,
          details,
        },
      });
  
      logger.info('Audit log created:', auditLog);
    } catch (error) {
      logger.error('Error handling audit event:', error);
    }
  }