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

function chunkText(text: string, size: number = 1000) {
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
                id : repoId,
                values : embeddings,
                metadata : {
                    repoId,
                    path : file.path,
                    chunkId
                }
            })

            const safeChunk = chunk.replace(/\u0000/g, " ")

            await prisma.chunks.create({
                data :  {
                    id : chunkId,
                    repoId,
                    path : file.path,
                    content : safeChunk
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
    const batchSize = 1000
    for(let i=0; i<chunks.length; i += batchSize){
        const batch = chunks.slice(i, i+=batchSize)
        await pineconeIndex.upsert(batch)
    }
   
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

export async function retrieveContext(repoId: string, queries: Object, topK: number = 500) {
    const query = Array.from(Object.values(queries)).join(",")
    const embeddings = await generateEmbeddings(query)

    
    const results = await pineconeIndex.query({
        vector: embeddings,
        topK,
        includeMetadata: true
    })

    // console.log("results -> ", results)

    const chunkIds : string[] = results.matches.map(match => match.metadata?.chunkId as string).filter(match => match != undefined)

    // console.log("chunkIds -> ", chunkIds)

    const chunks = await prisma.chunks.findMany({
        where : {
            id : {
                in : chunkIds
            },
        },
        select : {
            content : true
        },
    })

    // console.log("chunks -> ", chunks)

    const resultChunks = chunks.map(chunk => chunk.content.replaceAll(/\n/g, " "))

    // console.log("final chunks -> ", resultChunks)

    return resultChunks
}