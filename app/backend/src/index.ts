import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/users';
const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: true, // Allow all origins (or specify your frontend URL, e.g., "http://localhost:3000")
});


// Register User Routes
fastify.register(userRoutes);

const start = async () => {
    try {
      await fastify.listen({ port: 4000 });
      console.log('Fastify server is running on http://localhost:4000');
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

start();