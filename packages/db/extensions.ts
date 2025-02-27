import { Prisma } from "@prisma/client";

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        },
      },
    },
    model: {
      $allModels: {
        async softDelete<T extends { id: string }>(this: any, where: T) {
          return this.update({
            where,
            data: { isDeleted: true },
          });
        },
        async restore<T extends { id: string }>(this: any, where: T) {
          return this.update({
            where,
            data: { isDeleted: false },
          });
        },

        // Find all including soft-deleted records
        async findAll<T extends { where?: object }>(this: any, args?: T) {
          return this.findMany({ ...args, where: { ...args?.where } });
        },
      },
    },
  });
});
