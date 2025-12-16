"use client"
import { useState } from "react"
import React from 'react'
import { getReviews } from "@/module/reviews/actions"
import { QueryClient, useQuery } from "@tanstack/react-query"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { Button } from "@/components/ui/button"
import { CircleCheck, CircleX } from "lucide-react"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

const Reviews = () => {
    const { data: reviews, isLoading } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            return await getReviews()
        }
    });

    if(isLoading){
        <>Loading Reviews....</>
    }

    return (
        <div>
            <div>
                <div className="py-5 ml-5">
                    <h1 className="text-3xl font-bold">Review History</h1>
                    <p>View all AI code reviews</p>
                </div>
            </div>
            <div className="p-3">
                {
                    reviews && reviews?.length > 0 ? (<>{
                        reviews.map((review) => (
                            <Card key={review.prNumber}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between">
                                        <div ><div className="flex items-center gap-3 mb-1">
                                        <div className="text-xl">{review.prTitle}</div>
                                        {
                                            review.status === "completed" ? <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600"><><div className="flex items-center gap-2"><CircleCheck className="h-4 w-4"/>Completed</div></></Badge> : review.status === "failed" ? <Badge variant="secondary" className="bg-red-500 text-white dark:bg-red-600"><div className="flex items-center gap-2"><CircleX className="h-4 w-4"/>Failed</div></Badge> : <></>
                                        }
                                        </div>
                                        <div className="font-light">{review.repository.fullName}</div></div>
                                        <div>
                                            <Link href={review.prUrl}><Button variant={"ghost"}>
                                                <ExternalLink/>
                                            </Button></Link>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <div>{
                                            formatDistance(new Date(review.createdAt), new Date())
                                        }</div>
                                        <div className="bg-[#171717] p-2 rounded-md mb-3">{
                                            review.review.substring(0, 500)
                                        }</div>
                                        <div>
                                        <Button>
                                            <a href={review.prUrl} target="blanck">View full review on github</a>
                                        </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    }</>) : (<>No reviews are generated..</>)
                }
            </div>
        </div>
    )
}

export default Reviews