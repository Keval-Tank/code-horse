"use server"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { createWebHook, getRepositories } from "@/module/github/lib/github"
import { auth } from "@/lib/auth"


export const fetchRepositories = async(page:number=1, perPage:number=10) => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("Unauthorized")
    }

    const gitRepos = await getRepositories(page, perPage)

    const dbRepos = await prisma.repository.findMany({
        where : {
            userId : session.user.id
        }
    })

    const connectedRepoIds = new Set(dbRepos.map(repo => repo.githubId))

    return gitRepos.map((repo) => ({
            ...repo,
            isConnected : connectedRepoIds.has(BigInt(repo.id))
    }))
}

export const connectRepository = async (owner:string, repo : string, githubId : number) => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("Unauthorized")
    }
    
    const webHook = await createWebHook(owner, repo)

    if(webHook){
        await prisma.repository.create({
            data : {
                githubId : BigInt(githubId),
                name : repo,
                owner,
                fullName: `${owner}/${repo}`,
                url : `https://github.com/${owner}/${repo}`,
                userId : session.user.id
            }
        })
    }

    return webHook

}