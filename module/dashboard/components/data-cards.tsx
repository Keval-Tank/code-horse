"use client"
import React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GitCommit, GitPullRequest, MessageSquare, GitBranch } from 'lucide-react'

const DataCard = ({heading, icon, data, footer, isLoading} : {heading:string | undefined, icon:string | undefined, data:number | undefined, footer:string | undefined, isLoading: boolean}) => {
  return (
    <div><div>
              <Card className="w-[300px]">
                  <CardHeader className=''>
                    <div className='flex items-center justify-between text-sm font-bold gap-5 flex-wrap'>
                      <span>{heading}</span>
                      {
                        icon === "branch" ? <GitBranch className='size-[20]'/> : icon === "commit" ? <GitCommit className='size-[20]'/> : icon === "pull" ? <GitPullRequest className='size-[20]'/> : icon === "message" ? <MessageSquare className='size-[20]'/> : <></>
                      }
                    </div>
                  </CardHeader>
                  <CardContent>
                    {
                      isLoading ?
                      (<><div>
                        <p>Fetching data....</p>
                        </div></>) :
                      (<><div>
                    <span className='block text-4xl font-bold mb-2'>{data}</span>
                    <span className='block text-xs font-l'>{footer}</span>
                    </div></>)
                    }
                  </CardContent>
              </Card>
            </div></div>
  )
}

export default DataCard