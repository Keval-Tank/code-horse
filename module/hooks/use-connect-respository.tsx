"use client"
import { connectRepository } from "../repository/actions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {toast} from 'sonner'

export const useConnectRepository = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn : async({owner, repo, githubId} : {owner : string, repo:string, githubId:number}) => {
            return await connectRepository(owner, repo, githubId)
        },
        onSuccess : () => {
            toast.success("Connected to repository successfully!")
            queryClient.invalidateQueries({
                queryKey : ['repositories']
            })
        },
        onError : () => {
            toast.error("Failed to connect to repository")
            console.log("Failed to connect repo : ")
        }
    })
}