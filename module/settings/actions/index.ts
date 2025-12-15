"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache" 
import { success } from "zod"
import { deleteWebHook } from "@/module/github/lib/github"

export async function getUserProfile(){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })
        if(!session){
            throw new Error("Unauthorized")
        }
        const userProfile = await prisma.user.findFirst({
            where : {
                id : session.user.id
            },
            select : {
                id : true,
                name : true,
                email : true,
                image : true,
                createdAt : true
            }
        })
        return userProfile
    }catch(err){
        console.log("failed to fetch user profile", err)
        return null
    }
}

export async function updateUserProfile(data : {name? : string, email? : string}){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })
        if(!session){
            throw new Error("Unauthorized")
        }
        const updatedProfile = await prisma.user.update({
            where : {
                id : session.user.id
            },
            data : {
                name : data.name,
                email : data.email
            },
            select : {
                id : true,
                name : true,
                email : true
            }
        })

        revalidatePath('/dashboard/settings', "page")

        return {
            success : true,
            data : updateUserProfile
        }

    }catch(err){
        console.log("Failed to update user Profile")
        return {
            success : false,
            error : "Failed to update user profile"
        }
    }
}

export async function getConnectedRepositories(){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        }) 

        if(!session){
            throw new Error("Unauthorized")
        }

        const repositories = await prisma.repository.findMany({
            where : {
                userId : session.user.id
            },
            select : {
                id : true,
                name : true,
                url : true,
                fullName : true,
                createdAt : true
            },
            orderBy : {
                createdAt : "desc"
            }
        })

        if(!repositories) { 
            throw new Error("No Connected Repository Found")
        }

        return repositories
    }catch(err){
        console.log("Failed to fetch connected repositories")
        return []
    }
}

export async function disconnectRepository(repositoryId : string){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })

        if(!session){
            throw new Error("Unauthorized")
        }

        const repositoryToDelete = await prisma.repository.findUnique({
            where : {
                id : repositoryId,
                userId : session.user.id
            }
        })

        if(!repositoryToDelete){
            throw new Error("No Repository exists on this id to delete")
        }

        await deleteWebHook(repositoryToDelete.owner, repositoryToDelete.name)

        await prisma.repository.delete({
            where : {
                id : repositoryId,
                userId : session.user.id
            }
        })

        revalidatePath('/dashboard/settings',"page")
        revalidatePath("/dashboard/repository","page")

        return {success : true}

    }catch(err){
        console.log("Failed to delete webhook : ", err)
        return {
            success : false,
            error : err
        }
    }
}


export async function disconnectAllRepository(){
    try{
        const session = await auth.api.getSession({
            headers : await headers()
        })

        if(!session){
            throw new Error("Unauthorized")
        }

        const allRepositories = await prisma.repository.findMany({
            where : {
                userId : session.user.id
            }
        })

        await Promise.all(allRepositories.map(async(repo) => {
            await deleteWebHook(repo.owner, repo.name)
        }))

        await prisma.repository.deleteMany({
            where : {
                userId : session.user.id
            }
        })

        revalidatePath("/dashboard/repository", "page")
        revalidatePath("/dashboard/settings", "page")

        return {success : true}

    }catch(err){

    }
}