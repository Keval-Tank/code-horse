"use client"
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { ActivityCalendar } from "react-activity-calendar"
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import { getContributionStats } from '../actions'


const ContributionGraph = () => {
    const { theme } = useTheme()
    const { data, isLoading } = useQuery({
        queryKey: ['contribution-graph'],
        queryFn: async () => await getContributionStats(),
        staleTime: 1000 * 60 * 5
    })
    if (!data || !data.contributions?.length) {
        return (
            <div>
                <div>No Contribution Data found</div>
            </div>
        )
    }
    return (
        <div>
            <Card className='min-w-max'>
                <CardHeader>
                    <CardTitle>Contribution Activity</CardTitle>
                    <CardDescription>Visualizing your code frequency over the last year</CardDescription>
                </CardHeader>
                <CardContent>
                   {isLoading ?
                   (<><div>
                    <p>Fecthing activity heatmap...</p>
                    </div></>) : 
                   (<> <div className='p-5 flex items-center justify-center'>
                        <div className='text-center mt-0'>
                            <div>
                            <span className='font-bold text-xl'>{data.totalContributions}</span> contributions in the last year
                            </div>
                        <div className='mt-5'>
                            <ActivityCalendar
                                data={data.contributions}
                                colorScheme={theme === "dark" ? "dark" : "light"}
                                blockSize={15}
                                blockMargin={2}
                                fontSize={15}
                                blockRadius={7}
                                showWeekdayLabels
                                showMonthLabels
                                theme={
                                    {
                                        light: ['hsl(0, 0%, 92%)', 'hsl(142, 71%, 45%)'],
                                        dark: ['#161b22', 'hsl(142, 71%, 45%)']
                                    }
                                }
                            />
                        </div>
                        </div>
                    </div></>)}
                </CardContent>
            </Card>
        </div>
    )
}

export default ContributionGraph