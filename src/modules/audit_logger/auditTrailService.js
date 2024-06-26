import logger from "../../../logger.js";

export async function handleAuditEvent(event) {
  logger.info("Handle Audit Event Triggered!");
  try {
    const { userId, actionType, details, date } = event;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error(`User with ID ${userId} not found.`);
      return;
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        user: { connect: { id: userId } },
        event: actionType,
        details,
        date,
      },
    });

    logger.info("Audit log created:", auditLog);
  } catch (error) {
    logger.error("Error handling audit event:", error);
  }
}
