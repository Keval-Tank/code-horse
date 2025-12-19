"use client"
import React from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getConnectedRepositories, disconnectAllRepository, disconnectRepository } from '../actions'
import { toast } from 'sonner'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from 'lucide-react'

const RepositoryList = () => {
    const queryClient = useQueryClient()
    const [disconnectAllOpen, setDisconnectAllOpen] = useState(false)

    const { data: repositories, isLoading } = useQuery({
        queryKey: ['connected-repositories'],
        queryFn: async () => await getConnectedRepositories(),
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false
    })

    const disconnectMutation = useMutation({
        mutationFn: async (repositoryId: string) => {
            return await disconnectRepository(repositoryId)
        },
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ['connected-repositories'] })
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
                toast.success("Repository disconnected successfully")
            } else {
                toast.error("Failed to disconnect respository")
            }
        }
    })

    const disconnectAllMutation = useMutation({
        mutationFn: async () => {
            return await disconnectAllRepository()
        },
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: ['connected-repositories'] })
                queryClient.invalidateQueries({ queryKey: ['dahsboard-stats'] })
                toast.success(`All ${repositories?.length} repositories are disconnected`)
                setDisconnectAllOpen(true)
            } else {
                toast.error("Failed to disconnect all repositories")
            }
        }
    })
    return (
        <div className='mt-3'>
            <Card>
                <CardHeader className='flex items-center justify-between mb-2'>
                    <div >
                        <CardTitle>Connected Repositories</CardTitle>
                        <CardDescription>Manage your connected Github Repositories</CardDescription>
                    </div>
                    <div>
                        {
                         repositories && repositories.length > 0 && <AlertDialog open={disconnectAllOpen} onOpenChange={setDisconnectAllOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 />
                                    <span>Disconnect All</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className='flex gap-2 items-center'>
                                        <AlertTriangle color='red' /><span>Disconnect all repositories ?</span>
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will disconnect all {repositories?.length} connected repositories and delete all related AI reviews
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => disconnectAllMutation.mutate()} disabled={disconnectAllMutation.isPending} className='bg-red-500 hover:bg-red-900'>{
                                        disconnectAllMutation.isPending ? "Disconnecting..." : "Disconnect"
                                    }</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        }
                    </div>
                </CardHeader>
                <CardContent>
                    {
                        isLoading ?
                            (<>
                                <div>
                                    Getting all repositories....
                                </div>
                            </>) :
                            (<>
                                {
                                    repositories && repositories?.length === 0 ?
                                        (<><div>No connected repositories</div></>) :
                                        (<>{
                                            repositories?.map((repo) => (
                                                <div key={repo.id}>
                                                    <div className='flex items-center justify-between bg-[#333333] p-2 rounded-lg mt-2'>
                                                        <div className='flex justify-center items-center '>
                                                            <div className='text-lg font-semibold'>{repo.fullName}</div>
                                                            <Button variant={'ghost'} asChild>
                                                                <Link href={repo.url}>
                                                                    <ExternalLink />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                        <div>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger>
                                                                    <Button variant="ghost" size="lg">
                                                                        <Trash2 color='red' />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className='flex gap-2 items-center'>
                                                                            <AlertTriangle color='red' /><span>Disconnect repository ?</span>
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will disconnect {repo?.fullName} and delete all related AI reviews
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => disconnectMutation.mutate(repo.id)} disabled={disconnectMutation.isPending} className='bg-red-500 hover:bg-red-900'>{
                                                                            disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"
                                                                        }</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }</>)
                                }
                            </>)
                    }
                </CardContent>
            </Card>
        </div>
    )
}

export default RepositoryList