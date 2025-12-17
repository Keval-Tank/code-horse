"use server"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { createWebHook, getRepositories } from "@/module/github/lib/github"
import { auth } from "@/lib/auth"
import { inngest } from "@/inngest/client"
import { canAddRepo, incrementRepositoryCount } from "@/module/payments/lib/subscription"


export const fetchRepositories = async (page: number = 1, perPage: number = 10) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    const gitRepos = await getRepositories(page, perPage)

    const dbRepos = await prisma.repository.findMany({
        where: {
            userId: session.user.id
        }
    })

    const connectedRepoIds = new Set(dbRepos.map(repo => repo.githubId))

    return gitRepos.map((repo) => ({
        ...repo,
        isConnected: connectedRepoIds.has(BigInt(repo.id))
    }))
}

export const connectRepository = async (owner: string, repo: string, githubId: number) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }

    const webHook = await createWebHook(owner, repo)

    const canConnect = await canAddRepo(session.user.id);

    if (!canConnect) {
        throw new Error("Free tier limit exceded, Upgrade to Pro for more")
    }

    if (webHook) {
        await prisma.repository.create({
            data: {
                githubId: BigInt(githubId),
                name: repo,
                owner,
                fullName: `${owner}/${repo}`,
                url: `https://github.com/${owner}/${repo}`,
                userId: session.user.id
            }
        })
        await incrementRepositoryCount(session.user.id)
        try {
            await inngest.send({
                name: "repository.connected",
                data: {
                    owner,
                    repo,
                    userId: session.user.id
                }
            })
        } catch (err) {
            console.log("failed to send event :", err)
        }

    }

    return webHook

}