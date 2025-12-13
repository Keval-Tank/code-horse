"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache" 
import { success } from "zod"

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