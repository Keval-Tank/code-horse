export const runtime = "nodejs"

import prisma from "@/lib/db"
import { getRepoFileContents } from "@/module/github/lib/github"
import { chunkData, indexCodebase } from "@/module/ai/rag"
import { NextResponse } from "next/server"

export async function POST(req : Request){
    const {owner, repo, userId} = await req.json()

    const account = await prisma.account.findFirst({
        where : {
            providerId : "github",
            userId
        }
    })

    if(!account?.accessToken){
        return NextResponse.json({
            success : false,
            error : "access token not found"
        })
    }

    const files = await getRepoFileContents(account.accessToken, owner, repo)

    const chunkedData = await chunkData(`${owner}/${repo}`, files)

    await indexCodebase(chunkedData)

    return NextResponse.json({success : true})
}