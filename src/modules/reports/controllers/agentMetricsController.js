import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";

const prisma = new PrismaClient();

export async function getAllAgentIds(req, res, next) {
  logger.info("Get all agent ids triggered");
  try {
    const agents = await prisma.user.findMany({
      where: { role: "agent" },
      select: {
        id: true,
      },
    });

    logger.info(JSON.stringify(agents));

    const agentIds = agents.map((agent) => agent.id);

    logger.info(JSON.stringify(agentIds));

    res.json({
      agentIds,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAvgAgentResponseTime(req, res, next) {
  try {
    const agentId = req.params.agentId;

    const agent = await prisma.user.findUnique({
      where: { id: parseInt(agentId) },
    });

    const avgAgentResponseTime = agent.averageResponseTime;

    console.log("avgAgentResponseTime", avgAgentResponseTime);

    res.json({
      agent: agentId,
      metric: "Agent Response Time Metrics",
      avgAgentResponseTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getEmailAddress(req, res, next) {
  try {
    const agentId = req.params.agentId;

    const agent = await prisma.user.findUnique({
      where: { id: parseInt(agentId) },
    });

    const emailAddress = agent.email;

    res.json({
      agent: agentId,
      metric: "Agent Email Address",
      emailAddress,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAverageHandlingTime(req, res, next) {
  try {
    const agentId = req.params.agentId;

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: parseInt(agentId),
        status: "closed",
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
    });

    const numberOfTickets = tickets.length;

    if (!numberOfTickets) {
      res.json({
        agent: agentId,
        metric: "Agent Average Handling Time",
        averageHandlingTime: 0,
      });
    }

    const totalHandlingTime = tickets.reduce((acc, ticket) => {
      if (ticket.createdAt && ticket.closedAt) {
        const difference =
          (new Date(ticket.closedAt) - new Date(ticket.createdAt)) /
          (1000 * 60);
        return acc + difference;
      } else {
        return acc;
      }
    }, 0);

    console.log(totalHandlingTime);

    const averageHandlingTime = (totalHandlingTime / numberOfTickets).toFixed(
      2
    );

    console.log("averageHandlingTime", averageHandlingTime);

    res.json({
      agent: agentId,
      metric: "Agent Average Handling Time",
      averageHandlingTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTicketVolume(req, res, next) {
  try {
    const agentId = req.params.agentId;
    const data = await prisma.$queryRaw`
    SELECT 
      DATE("createdAt") AS date,
      COUNT(*) AS total_tickets,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_tickets
    FROM 
      public."Ticket"
    WHERE 
      "userId" = ${parseInt(agentId)}
    GROUP BY 
      DATE("createdAt")
    ORDER BY 
      DATE("createdAt");
  `;

    const formattedData = data.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      total_tickets: parseInt(entry.total_tickets, 10),
      closed_tickets: parseInt(entry.closed_tickets, 10) || 0,
    }));

    res.json({
      agent: agentId,
      metric: "Agent Ticket Volume",
      ticketVolume: formattedData,
    });
  } catch (error) {
    logger.error("Error fetching ticket volume data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
