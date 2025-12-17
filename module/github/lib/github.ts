import {Octokit} from 'octokit'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { headers } from 'next/headers'



export const getGithubToken = async() => {
    const session = await auth.api.getSession({
        headers : await headers()
    })

    if(!session){
        throw new Error("Unauthorized")
    }

    const account = await prisma.account.findFirst({
        where : {
            userId : session.user.id,
            providerId : "github"
        }
    })

    if(!account?.accessToken){
        throw new Error("No Github access token found")
    }

    return account.accessToken;
}

export async function fetchUserContribution(token : string, username : string){
    const octokit = new Octokit({auth : token})

    const query = `
    query($username:String!){
      user(login:$username){
        contributionsCollection {
           contributionCalendar{
                totalContributions
                weeks{
                    contributionDays{
                       contributionCount
                       date
                       color
                    }
                }
           }
        }
      }
    }
    `

    interface ContributionData{
        user : {
            contributionsCollection : {
                contributionCalendar : {
                    totalContributions : number
                    weeks : {
                        contributionDays : {
                            contributionCount : number
                            date : string | Date
                            color : string
                        }
                    }
                }
            }
        }
    }

    try{
        const response : ContributionData = await octokit.graphql(query,{
            username
        }) 
        return response.user.contributionsCollection.contributionCalendar
    }catch(err){
        console.log("Error while Fecthing Data : ", err)
    }
}

export const getRepositories = async(page : number=1, perPage : number=10) => {
    const token = await getGithubToken()
    const octokit = new Octokit({
        auth : token
    })
    const { data} = await octokit.rest.repos.listForAuthenticatedUser({
        sort : "updated",
        direction : "desc",
        visibility : "all",
        per_page : perPage,
        page : page
    })
    return data
}

export const createWebHook = async(owner : string, repo : string) => {
    const token = await getGithubToken()
    const octokit = new Octokit({
        auth : token
    })

    const webHookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/github`

    const {data : hooks} = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    })

    const existingHook = hooks.find(hook => hook.config.url === webHookUrl)

    if(existingHook){
        return existingHook
    }

    const {data} = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config : {
            url : webHookUrl,
            content_type : "json"
        },
        events: ["pull_request"]
    })

    return data

}

export const deleteWebHook = async(owner : string, repo : string) => {
    try{
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth : token
        })
        const webHookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/github`

        const {data : hooks} = await octokit.rest.repos.listWebhooks({
            owner,
            repo
        })

        const hookToDelete = hooks.find(hook =>  hook.config.url === webHookUrl.trim()
            // console.log("hook url -> ",hook.config.url)
            // console.log("type of hook url ->", typeof hook.config.url)
            // console.log("webHookurl ->", webHookUrl)
            // console.log("type of webHookUrl ->", typeof webHookUrl)
            // console.log("is equal ->", hook.config.url == webHookUrl)
        )

        if(hookToDelete){
            await octokit.rest.repos.deleteWebhook({
                owner,
                repo,
                hook_id : hookToDelete.id
            })

            return true
        }

        return false

    }catch(err : any){
        console.log("Failed to delete hook : ", err)
        console.log(err.request)
        console.log(err.response)
        return false
    }
}

export async function getRepoFileContents(token : string, owner : string, repo : string, path:string = "")
:Promise<{path:string, content:string}[]>
{
    const octokit = new Octokit({
        auth : token
    })
    const {data} = await octokit.rest.repos.getContent({owner, repo, path})
    
    if(!Array.isArray(data)){
        if(data.type === "file" && data.content){
            return [{
                path : data.path,
                content : Buffer.from(data.content, "base64").toString('utf-8')
            }]
        }
        return [];
    }

    let files : {path:string, content:string}[] = []

    for(const item of data){
        if(item.type === "file"){
            const { data : fileData} = await octokit.rest.repos.getContent({
                owner,
                repo,
                path : item.path
            })
            if(!Array.isArray(fileData) && fileData.type === "file" && fileData.content){
                if(!item.path.match('/\.(png|jpg|jpeg|pdf|svg|ico|zip|tar|gz)$/i')){
                    files.push({
                        path : item.path,
                        content : Buffer.from(fileData.content, "base64").toString('utf-8')
                    })
                }
            }
        }else if(item.type === "dir"){
            const subfiles = await getRepoFileContents(token, owner, repo, item.path)

            files = files.concat(subfiles)
        }
    }

    return files
}

interface PullReqData {
    diff : string,
    title : string,
    description : string,
    token? : string
}

export async function getPullReqDiff(token:string, owner:string, repo:string, prNumber:number):Promise<PullReqData>{
    const octokit = new Octokit({
        auth : token
    })

    const {data : pr} = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number : prNumber
    })

    const {data : diff} = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number : prNumber,
        mediaType : {
            format : 'diff'
        }
    })

    console.log("pull req title -> ", pr.title)

    return {
        diff : diff as unknown as string,
        title : pr.title,
        description : pr.body || " ",
    }
}

export async function postReviewComment(token : string, owner: string, repo:string, prNumber : number, review : string){
    const octokit = new Octokit({
        auth : token
    })

    await octokit.rest.issues.createComment({
        owner, 
        repo,
        issue_number : prNumber,
        body : `## AI Code Review\n\n${review}\n\n------\n*Powered By CodeHorse*##`
    })
}