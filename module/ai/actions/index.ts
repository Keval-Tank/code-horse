"use server"
import prisma from "@/lib/db";
import { getPullReqDiff } from "@/module/github/lib/github";
import { inngest } from "@/inngest/client";


export async function reviewPullRequest(owner:string, repo:string, prNumber : number){
try{
        const repository = await prisma.repository.findFirst({
        where : {
            owner,
            name : repo   
        },
        include : {
            user : {
                include : {
                    accounts : {
                        where : {
                            providerId : "github"
                        }
                    }
                }
            }
        }
    })

    if(!repository){
        throw new Error(`No repository with ${owner} and ${repo} found`)
    }

    const githubAccount = repository.user.accounts[0]

    if(!githubAccount.accessToken){
        throw new Error(`No access token found in database : Unauthorized`)
    }

    const token = githubAccount.accessToken

    const {title} = await getPullReqDiff(token,owner, repo, prNumber)

    await inngest.send({
        name : "pr.review.requested",
        data : {
            owner,
            repo,
            prNumber,
            userId : repository.user.id
        }
    })

    return {success : true, message : "Review Queued"}
}catch(err){
    try {
        const repository = await prisma.repository.findFirst({
           where : {
             owner,
            name : repo
           }
        })

        if(repository){
            await prisma.review.create({
                data : {
                    repositoryId : repository.id,
                    prNumber,
                    prTitle : "Failed to fetch PR",
                    prUrl : `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                    review : `Error occured during reviewing PR`,
                    status : "failed"
                }
            })
        }
    } catch (error) {
        console.log("Failed to save error from database", error)
    }
}

}