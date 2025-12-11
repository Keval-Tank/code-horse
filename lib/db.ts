import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
    connectionString:process.env.DATABASE_URL
})

// singleton method as to use only a single instance of prisma through the project,
// create client only if required
const prismaClientSinglton = () => {
    return new PrismaClient({adapter})
}

// setting "prismaGlobal" property of type same as type of "prismaClientSinglton" function to globalThis object and "& typeof global" line tells that to append new property
declare const globalThis: {
    prismaGlobal : ReturnType<typeof prismaClientSinglton>
} & typeof global;

// first check in globalThis object for "prismaGlobal" if exists then do not create it again, if not present then create a new on by calling function
const prisma = globalThis.prismaGlobal || prismaClientSinglton();

if(process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma