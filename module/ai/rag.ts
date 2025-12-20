import { embed } from "ai";
import { google } from "@ai-sdk/google"
import { pineconeIndex } from "@/lib/pinecone"
import prisma from "@/lib/db";


export async function generateEmbeddings(text: string) {
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: text
    })
    return embedding
}

function chunkText(text: string, size: number = 800) {
    const chunks = []
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size))
    }
    return chunks
}


export async function chunkData(repoId : string, files: { path: string; content: string }[]){
    
    const chunks : {
        id : string,
        values : number[],
        metadata : {
            repoId : string,
            path : string,
            chunkId : string
        }
    }[] = []
    for(let file of files){
        const chunkedFileContent = chunkText(file.content)

        for(let chunk of chunkedFileContent){
            const chunkId = crypto.randomUUID()
            const embeddings = await generateEmbeddings(chunk)

            chunks.push({
                id : chunkId,
                values : embeddings,
                metadata : {
                    repoId,
                    path : file.path,
                    chunkId
                }
            })

            await prisma.chunks.create({
                data :  {
                    id : chunkId,
                    repoId,
                    path : file.path,
                    content : chunk
                },
                select:{
                    id : true
                }
            })

        }
    }
    return chunks
}

export async function indexCodebase(chunks : {
        id : string,
        values : number[],
        metadata : {
            repoId : string,
            path : string,
            chunkId : string
        }
    }[]) {
    // const batchSize = 100
   chunks.forEach(async(chunk) => {
    await pineconeIndex.upsert(chunk as any)
   })
   chunks.length = 0;
    console.log("Indexing completed")
}

export const RANK_QUERIES = {
    hygiene : "gitignore build output environment variables production deployment CI",
    architecture : "folder structure architecture services controllers modules layers domain",
    structure : "project structure src folders organization modules layout",
    codeQuality : "clean code readability functions error handling naming conventions comments",
    documentation : "README documentation setup usage install",
    testing : "tests coverage jest mocha testing framework",
    security : "authentication authorization tokens secrets environment variables"
}

export async function retrieveContext(repoId: string, queries: Object, topK: number = 5) {
    const query = Array.from(Object.values(queries)).join(",")
    const embeddings = await generateEmbeddings(query)

    
    const results = await pineconeIndex.query({
        vector: embeddings,
        // filter : {},
        topK,
        includeMetadata: true
    })

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean)
}