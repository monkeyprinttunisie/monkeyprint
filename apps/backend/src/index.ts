import { formatText } from "@monkeyprint/utils/format-text";
import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

// Declare a route
fastify.get("/", async function handler(request, reply) {
  // get the query param "text"
  const { text } = request.query as { text?: string };
  if (!text) {
    return reply.status(400).send({ error: "text is required" });
  }
  return { text: formatText(text) };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
