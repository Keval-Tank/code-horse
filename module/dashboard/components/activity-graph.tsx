import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

const ActivityGraph = ({monthlyActivity}) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>This shows your activity throughout the year</CardDescription>
        </CardHeader>
        <CardContent>
            <div className='h-[300px]'>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyActivity || []}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip contentStyle={{backgroundColor : 'var(--background)', borderColor : 'var(--border)'}}
                            itemStyle={{color : 'var(--foreground)'}}
                        />
                        <Legend/>
                        <Bar dataKey={'commits'} name={"Commits"} fill='#3b82f6' radius={[4, 4, 0, 0]}/>
                        <Bar dataKey={'prs'} name={"Pull requests"} fill='#3bf686ff' radius={[4, 4, 0, 0]}/>
                        <Bar dataKey={'reviews'} name={"AI reviews"} fill='#c13e39ff' radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  )
}

export default ActivityGraph