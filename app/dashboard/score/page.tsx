"use client"
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/components/ui/card'


const ScorePage = () => {
   type Score = {
   id : number,
   repoId : string,
   text : string,
   repository : any
 }
 
  const {data : scores, isLoading, error} = useQuery<Score[]>({
    queryKey : ['scores'],
    queryFn : async() => {
      const res = await fetch(`/api/fetch-scores`, {
        method : "GET"
      })
      if(!res.ok){
        return new Error("Failed to fetch scores data")
      }
      return res.json()
    }
  })

  if(isLoading){
    return (
      <div>Loading data...</div>
    )
  }

  return (
    <div>
      <div>
         <div className="py-5 ml-5">
                    <h1 className="text-3xl font-bold">Repository Scores</h1>
                    <p>Here are AI generated scores for your respository</p>
                </div>
      </div>
      <div className='p-3'>{
        scores?.map(score => (
          <Card key={score.id} className='mb-2'>
            <CardContent>
              <div><span className='font-bold'>Repo: </span>{score.repository?.name}</div>
              <div><div className='font-bold'>Score</div><div className='bg-black p-3 rounded-lg'>{score.text}</div></div>
            </CardContent>
          </Card>
        ))
      }</div>
    </div>
  )
}

export default ScorePage
