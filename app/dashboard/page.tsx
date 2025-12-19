"use client"
import React from 'react'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getMonthlyActivity } from '@/module/dashboard/actions'
import DataCard from '@/module/dashboard/components/data-cards'
import ContributionGraph from '@/module/dashboard/components/contribution-graph'
import ActivityGraph from '@/module/dashboard/components/activity-graph'
import { getUserUsage } from '@/module/payments/lib/subscription'


const Dashboard = () => {
  const {data : stats, isLoading} = useQuery({
    queryKey : ["dashboard-stats"],
    queryFn : async() => await getDashboardStats(),
    refetchOnWindowFocus : false
  })

  const {data : monthly_activity, isLoading:isLoadingActivity} = useQuery({
    queryKey : ['monthly-activity'],
    queryFn : async() => await getMonthlyActivity(),
    refetchOnWindowFocus : false
  }) 
  
  return (
    <div>
      <div>
        <div className="py-5 ml-5">
           <div>
            <h1 className="text-3xl font-bold">DashBoard</h1>
           <p>Overview of your coding activity and AI reviews</p>
           </div>
        </div>
        <div className='flex items-center gap-3 ml-5'>
        <DataCard heading="Total Repositories" icon="branch" data={stats?.totalRepos} footer="Connected Repositories" isLoading={isLoading}/>
        <DataCard heading="Total Commits" icon="commit" data={stats?.totalCommits!} footer="in last year" isLoading={isLoading}/>
        <DataCard heading="Pull Requests" icon="pull" data={stats?.totalPRs!} footer="All Time" isLoading={isLoading}/>
        <DataCard heading="AI Reviews" icon="message" data={stats?.totalReviews!} footer="Generated Reviews" isLoading={isLoading}/>
        </div>
        <div className='mt-6 px-5'>
        <ContributionGraph />
        </div>
        <div className='mt-5 px-5'>
          {
            isLoading ? (<><div>Data is Loading...</div></>) : (<><ActivityGraph monthlyActivity={monthly_activity}/></>)
          }
        </div>
        <div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard