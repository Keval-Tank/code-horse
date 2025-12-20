import { inngest } from "../client";
import prisma from "@/lib/db";
import { getRepoFileContents} from "@/module/github/lib/github";
import { indexCodebase } from "@/module/ai/rag";
import { chunkData } from "@/module/ai/rag";


export const indexRepo = inngest.createFunction(
    { id: "index-repo" },
    { event: "repository.connected" },
    async ({ event, step }) => {
       await step.run("fetching-and-indexing-repo", async() => {
            try{
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/index-repo`, {
        method: "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify(event.data)
       })

       return {success : true}
       }catch(error){
        console.log("Failed to index : ", error)
       }
       })
    },
);