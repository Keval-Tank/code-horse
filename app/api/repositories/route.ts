import { NextResponse } from "next/server";
import { fetchRepositories } from "@/module/repository/actions";

export async function GET(req : Request){
    try{
        const {searchParams} = new URL(req.url)
        const page = Number(searchParams.get("page") ?? 1)
        const limit = Number(searchParams.get("limit") ?? 10)

        const data = await fetchRepositories(page, limit)

        return NextResponse.json(data)
    }catch(error){
        console.log("Repo API error: ", error)
        return NextResponse.json(
            { message: "Failed to fetch repositories" },
            {status: 500 }
        )
    }
}