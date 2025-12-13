"use client"
import { useState, useEffect, useRef } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Star, Search } from 'lucide-react'
import { useRepositories } from '@/module/hooks/use-repositories'
import Link from 'next/link'
import { RepositoryListSkeleton } from '@/module/repository/components/repo-skeleton'
import { connectRepository } from '@/module/repository/actions'
import { useConnectRepository } from '@/module/hooks/use-connect-respository'

interface Repository {
    id: number ,
    name: string,
    full_name: string,
    description: string | null,
    html_url: string,
    stargazers_count: number,
    language: string | null,
    topics: string[] | undefined,
    isConnected?: boolean
}

const RepositoryPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [localConnectingId, setLocalConnectingId] = useState<number | null>(null)
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useRepositories()

    const {mutate : connectRepo} = useConnectRepository()
    const observerTarget = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const observer = new IntersectionObserver((enteries) => {
           if(enteries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
             fetchNextPage()
           }
        }, {
            threshold : 0.1
        })
        const currentTarget = observerTarget.current
        if(currentTarget){
            observer.observe(currentTarget)
        }
        return () => {
            if(currentTarget){
                observer.unobserve(currentTarget);
            }
        }   
    }
    ,[hasNextPage, isFetchingNextPage, fetchNextPage])

    const allRepositories = data?.pages?.flatMap((page) => page) || []

    const filteredRepositories = allRepositories.filter((repo : any) => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleConnect = (repo:Repository) => {
        setLocalConnectingId(repo.id)
        connectRepo({
            owner : repo.full_name.split('/')[0],
            repo : repo.name,
            githubId : repo.id
        }, {
            onSettled : () => setLocalConnectingId(null)
        })
    }

    return (
        <div>
            <div>
                <div className="py-5 ml-5">
                    <h1 className="text-3xl font-bold">Repositories</h1>
                    <p>Manage and view al your Github repositories</p>
                </div>
            </div>
            <div className=''>
                <div className='px-4'>
                    <div className="flex items-center p-0 bg-[#363636] p-1 rounded-lg">
                        <Search className='text-muted-forground'/>
                        <Input
                            placeholder="Search repositories.."
                            className='border-0'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className='p-3'>
                    {
                        filteredRepositories.map((repo : any) => (
                            <div key={repo.id} className='mb-3'>
                            <Card>
                                <CardHeader>
                                   <div className='w-full flex justify-between'>
                                     <div className='flex gap-3 items-center'>
                                        <CardTitle className="font-bold text-xl">{repo.name}</CardTitle>
                                        <div className='font-light text-xs'>{repo.language}</div>
                                        {
                                            repo.isConnected ? (<>
                                            <Badge variant="default" color='blue' className="h-5 ">Connected</Badge>
                                            </>) : (<></>)
                                        }
                                     </div>
                                     <div className='flex gap-3 items-center'>
                                        <Button variant={'ghost'} asChild>
                                            <Link href={repo.html_url}>
                                              <ExternalLink/>
                                            </Link>
                                        </Button>
                                        <Button
                                        onClick={() => handleConnect(repo)}
                                        disabled={localConnectingId === repo.id || repo.isConnected}
                                        variant={repo.isConnected ? "outline" : "default"}
                                        >{localConnectingId === repo.id ? "Connecting..." : repo.isConnected ? "Connected" : "Connect"}</Button>
                                     </div>
                                   </div>
                                   <div>
                                        <CardDescription>{repo.description}</CardDescription>
                                </div>
                                    
                                </CardHeader>
                                <CardContent>    
                                </CardContent>
                                <CardFooter>
                                    <div className='flex items-center gap-2'>
                                        <Star/>
                                        <span className='font-bold text-lg'>{repo.stargazers_count}</span>
                                    </div>
                                </CardFooter>
                            </Card>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className='p-4'>
                <div ref={observerTarget}>{
                    isFetchingNextPage && <RepositoryListSkeleton/>
                   }{
                    !hasNextPage && allRepositories.length > 0 && (<p className='text-xl font-light text-center'>No More Repositories</p>)
                   }</div>
            </div>
        </div>
        // <>
        // {
        //     data?.pages.flat().map((page) => (<div key={page.id}>{page.id}</div>))
        // }
        // </>
    )
}

export default RepositoryPage