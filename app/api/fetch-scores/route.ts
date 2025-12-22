import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(){
    const scores = await prisma.score.findMany({
        include : {
            repository : {
                select : {
                    name : true
                }
            }
        }
    });
    return NextResponse.json(scores)
}