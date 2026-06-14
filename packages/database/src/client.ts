import dotenv from "dotenv";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
// Use the generated client directly so the runtime uses the generated files in this package
// Import the generated client file directly (ensure resolution at runtime)
import { PrismaClient } from "../generated/prisma/client";

dotenv.config({
    path: path.resolve(import.meta.dirname, "../../../.env"),
    override: true,
});

const databaseUrl = process.env.DATABASE_URL?.replace(/([?&])sslmode=(prefer|require|verify-ca)\b/i, "$1sslmode=verify-full");

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const db = new PrismaClient({ adapter });