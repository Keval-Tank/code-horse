"use client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchRepositories } from "../repository/actions"

// async function fetchRepositories(page: number, limit = 10) {
//   const res = await fetch(
//     `/api/repositories?page=${page}&limit=${limit}`,
//     { credentials: "include" }
//   )

//   if (!res.ok) {
//     throw new Error("Failed to fetch repositories")
//   }

//   return res.json()
// }

export const useRepositories = () => {
    return useInfiniteQuery({
        queryKey : ['repositories'],
        queryFn : ({pageParam=1}) => fetchRepositories(pageParam, 10),
        getNextPageParam: (lastPage, allPages) => {
            if(lastPage.length < 10){
                return undefined
            }
            return allPages.length + 1
        },
        initialPageParam : 1,
    })
}