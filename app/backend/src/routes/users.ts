import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function userRoutes(fastify: FastifyInstance) {
  // GET /users - Fetch all users
  fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    return users;
  });

  // POST /users - Create a new user
  fastify.post('/users', async (request, reply) => {
    const { name, email } = request.body as { name: string; email: string };
    const user = await prisma.user.create({
      data: { name, email },
    });
    return user;
  });
}
