import { NextRequest, NextResponse } from "next/server";

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