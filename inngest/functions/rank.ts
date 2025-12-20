import { generateText } from "ai"
import { inngest } from "../client"
import { google } from "@ai-sdk/google"
import { retrieveContext } from "@/module/ai/rag"


export const rankArepo = inngest.createFunction(
    { id: "rank-a-repo" },
    { event: "rank.a.repo" },
    async ({ event, step }) => {
        const {repoId} = event.data
        const context = await step.run("retrieve-context", async() => {
            const query = "folder structure architecture services controllers modules layers domain"
            return await retrieveContext(repoId, query)
        })
        await step.run("rank-a-repo", async () => {
            const prompt = `You are evaluating a software repository.

Score ONLY the following dimension:
"Repository folder structure & architecture"

Here is the context for repository ${context.join("\n\n")}

Rules:
- Base your score ONLY on the provided context
- If signals are missing, score lower
- Return a number from 0 to 10
- Briefly justify the score in 1 sentence
- Give output in following format 
- output format : {
  Score : (place score here),
  message : (score justifucation sentence or any error)
} in json form and without leading and trailing text
`
            const {text} = await generateText({
                model : google("gemini-2.5-flash"),
                prompt
            })

            console.log("text -> ", text.replaceAll('\n', "\n"))

            return text
        })
    }
)