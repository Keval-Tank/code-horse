import { embed } from "ai";
import {google} from "@ai-sdk/google"
import {pineconeIndex} from "@/lib/pinecone"


export async function generateEmbeddings(text:string){
    const {embedding} = await embed({
        model : google.textEmbeddingModel('text-embedding-004'),
        value : text
    })
    return embedding
}

export async function indexCodebase(repoId : string, files : {path : string; content : string}[]){
    const vector = []

    for(let file of files){
        const content = `File: ${file.path} \n\n${file.content}`;

        const truncatedContent = content.slice(0, 8000)

        try{
            const embeddings = await generateEmbeddings(truncatedContent)

            vector.push({
                id : `${repoId}-${file.path.replace(/\//g, '_')}`,
                values :embeddings,
                metadata : {
                    repoId,
                    path : file.path,
                    content : truncatedContent
                }
            })
        }catch(err){
            console.log(`Failed to embed data at ${file.path} : `, err)
        }

       if(vector.length > 0){
        const batchSize = 100
        for(let i=0; i<vector.length; i+=batchSize){
            const batch = vector.slice(i, i+batchSize)
            pineconeIndex.upsert(batch)
        }
       }
    }

    console.log("Indexing completed")
}

export async function retrieveContext(repoId : string, query: string, topK:number = 5){
    const embeddings = await generateEmbeddings(query)

    const results = await pineconeIndex.query({
        vector : embeddings,
        filter : {repoId},
        topK,
        includeMetadata : true
    })

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean)
}