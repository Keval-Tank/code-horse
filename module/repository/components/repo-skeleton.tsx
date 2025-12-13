import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

export function RepositoryCardSkeleton() {
    return (
        <Card className="mt-5">
            <CardHeader>
                <div className='w-full flex justify-between'>
                    <div className='flex gap-3 items-center'>
                        <Skeleton className="font-bold text-xl"></Skeleton>
                        <div className='font-light text-xs'></div>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <Skeleton>
                            
                        </Skeleton>
                        <Skeleton
                            
                        ></Skeleton>
                    </div>
                </div>
                <div>
                    <CardDescription></CardDescription>
                </div>

            </CardHeader>
            <CardContent>
            </CardContent>
            <CardFooter>
                <div className='flex items-center gap-2'>
                   
                </div>
            </CardFooter>
        </Card>
    )
}

export function RepositoryListSkeleton() {
    return (
        <div>{Array.from({ length: 5 }).map((_, i) => (
            <RepositoryCardSkeleton key={i} />
        ))}</div>
    )
}