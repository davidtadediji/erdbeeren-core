export const getConversation = async (userId, ticketId) => {
  try {
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};
