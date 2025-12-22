import { generateText } from "ai"
import { inngest } from "../client"
import { google } from "@ai-sdk/google"
import { retrieveContext } from "@/module/ai/rag"
import { RANK_QUERIES } from "@/module/ai/rag"
import prisma from "@/lib/db"


export const rankArepo = inngest.createFunction(
    { id: "rank-a-repo" },
    { event: "rank.a.repo" },
    async ({ event, step }) => {
        const {repoId, owner, repoName} = event.data
        const context = await step.run("retrieve-context", async() => {
            const query = "folder structure architecture services controllers modules layers domain"
            return await retrieveContext(repoId, RANK_QUERIES)
        })
        await step.run("rank-a-repo", async () => {
            const prompt = `You are evaluating a software repository using the provided context

Evaluate ONLY the following dimensions:
${Object.keys(RANK_QUERIES).join("\n")}

for this repository:
${repoId}
and visit this "https://github.com/${owner}/${repoName}" url and analyze it's folder structure and go through files and analayze code for code quality and having in-depth context of repository.

Definitions:
${Object.entries(RANK_QUERIES).map(([key, desc]) => ` -${key}: ${desc}`).join(',')}

Rules:
- Use ONLY the provided context
- Do NOT assume missing files or features
- If insufficient evidence exists, give a lower score
- Do NOT hallucinate improvements
- Output MUST be valid JSON only

Context:
${context.join('\n\n')}

Output Format (STRICT):
{ 
   "<dimension>" : {
    "score" : number(0-10),
    "suggestions" : string (if you think any suggestions for advancement),
    "corrections" : string (if you think there any syntax or indentation corrections for increasing code quality and code readability),
    "critical" : string (if you think there are any misconfiguration or faulty files which can lead to any potential threats, if explicitly available)
   }
}
`
            const {text} = await generateText({
                model : google("gemini-3-flash-preview"),
                prompt
            })

            await prisma.score.create({
                data : {
                    repoId : repoId,
                    text : text
                }
            })

            return text
        })
    }
)