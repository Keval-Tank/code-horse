"use server"
import { fetchUserContribution, getGithubToken } from "@/module/github/lib/github"
import { Octokit } from "octokit"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { useQuery } from "@tanstack/react-query"
import { getUserUsage } from "@/module/payments/lib/subscription"
import prisma from '@/lib/db'


export async function getContributionStats(){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })
        if(!session?.user){
            throw new Error("Session not found")
        }
        const token = await getGithubToken();
        const octokit = new Octokit({
            auth : token
        })
        const {data : user} = await octokit.rest.users.getAuthenticated()
        const userName = user.login

        const calendar = await fetchUserContribution(token, userName)

        if(!calendar){
            return null
        }

        const contributions = calendar.weeks.flatMap((week : any) => week.contributionDays.map((day : any) => ({
            date : day.date,
            count : day.contributionCount,
            level : Math.min(4, Math.floor(day.contributionCount/3)),
        })))

        return {
            contributions,
            totalContributions : calendar.totalContributions
        }

    }catch(error){
        console.log("Error while fetching contribution graph data", error)
        return null
    }
}

export async function getDashboardStats(){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })

        if(!session?.user){
            throw new Error("Unauthorized")
        }

        const userUsage = await prisma.userUsage.findUnique({
            where : {
                userId : session.user.id
            }
        })

        const token = await getGithubToken()
        const octokit = new Octokit({auth : token})

        const {data : user} = await octokit.rest.users.getAuthenticated()

        const totalRepos = userUsage?.repositoryCount || 0

        const calendar = await fetchUserContribution(token, user.login)

        const totalCommits = calendar?.totalContributions || 0

        const {data : prs} = await octokit.rest.search.issuesAndPullRequests({
            q : `author:${user.login} type:pr`,
            per_page : 1
        })


        const totalPRs = prs.total_count
        const totalReviews = Object.keys(userUsage?.reviewCounts!).length || 0

        return{
            totalCommits,
            totalPRs,
            totalReviews,
            totalRepos
        }

    }catch(error){
        console.log(error)
        return {
            totalCommits : 0,
            totalPRs : 0,
            totalReviews : 0,
            totalRepos : 0
        }
    }
}

export async function getMonthlyActivity(){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })

        if(!session?.user){
            throw new Error("Unauthorized")
        }

        const token = await getGithubToken()
        const octokit = new Octokit({
            auth : token
        })

        const {data : user} = await octokit.rest.users.getAuthenticated()

        const calendar = await fetchUserContribution(token, user.login)

        if(!calendar){
            return [];
        }

        const monthlyData : {
            [key : string] : {commits : number; prs : number; reviews : number}
        } = {}

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ]

        const now = new Date()
        for(let i=5; i >= 0; i--){
            const date = new Date(now.getFullYear(), now.getMonth()-i, 1);
            const monthKey = monthNames[date.getMonth()];
            monthlyData[monthKey] = {commits : 0, prs : 0, reviews : 0}
        }

        calendar.weeks.forEach((week : any) => {
            week.contributionDays.forEach((day : any) => {
                const date = new Date(day.date)
                const monthKey = monthNames[date.getMonth()]
                if(monthlyData[monthKey]){
                    monthlyData[monthKey].commits += day.contributionCount;
                }
            })
        })

        const sixMonthAgo = new Date()
        sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);

        const genearteSampleReviews = () => {
            const sampleReviews = []
            const now = new Date()

            for(let i=0; i<=45; i++){
                const randomDaysAgo = Math.floor(Math.random()*180)
                const reviewDate = new Date(now);
                reviewDate.setDate(reviewDate.getDate() - randomDaysAgo)

                sampleReviews.push({
                    createdAt : reviewDate
                })
            }

            return sampleReviews
        }

        const reviews = genearteSampleReviews()

        reviews.forEach((review) => {
            const monthKey = monthNames[review.createdAt.getMonth()];
            if(monthlyData[monthKey]){
                monthlyData[monthKey].reviews += 1
            }
        })

        const {data : prs} = await octokit.rest.search.issuesAndPullRequests({
            q : `language:javascript author:${user.login} type:pr created:>${sixMonthAgo.toISOString().split("T")[0]}`,
            per_page : 100
        })

        prs.items.forEach((pr) => {
            const date = new Date(pr.created_at)
            const monthKey = monthNames[date.getMonth()]
            if(monthlyData[monthKey]){
                monthlyData[monthKey].prs += 1
            }
        });

        return Object.keys(monthlyData).map((name) => ({
            name,
            ...monthlyData[name]
        }))


    }catch(error){
        console.log("Error while fetching data 1 : ",error)
        return []
    }
}