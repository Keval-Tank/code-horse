import { NextRequest, NextResponse } from "next/server";
import { reviewPullRequest } from "@/module/ai/actions";

export async function POST(req : NextRequest){
    try{
        const body = await req.json()
        const event = req.headers.get('x-github-event');
        console.log("Event recieved from Git : ", event)
        if(event === "ping"){
            return NextResponse.json({
                message : "Pong"
            }, {status : 200})
        }
        if(event === "pull_request"){
            const action = body.action
            const repoName = body.repository.full_name
            const prNumber = body.number

            const [owner, repo] = repoName.split('/')

            if(action === "opened" || action === "synchronize"){
                reviewPullRequest(owner, repo, prNumber)
                .then(() => console.log(`review completed for ${repo} #${prNumber}`))
                .catch((err: any) => console.log(`review failed for ${repo} #${prNumber}:`, err))
            }
        }
        return NextResponse.json({
            message : "Event Process"
        }, {status : 200})
    }catch(err){
        console.log("Failed to process event : ", err);
        return NextResponse.json({
            error : "Failed to process event"
        }, {status : 500})
    }
}