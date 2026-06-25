import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pool from "./postgres.js";

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;