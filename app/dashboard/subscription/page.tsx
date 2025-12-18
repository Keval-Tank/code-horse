"use client";
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { syncSubscriptionStatus } from '@/module/payments/action'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionData } from '@/module/payments/action'
import { RefreshCcw } from 'lucide-react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { ExternalLink } from 'lucide-react';




const PLAN_FEATURES = {
    free: [
        { name: "Up to 5 repositories", included: true },
        { name: "Up to 5 reviews per repository", included: true },
        { name: "Basic code reviews", included: true },
        { name: "Community support", included: true },
        { name: "Advance Analytics", included: false },
        { name: "Priority Support", included: false }
    ],
    pro: [
        { name: "Unlimited repositories", included: true },
        { name: "Unlimited repository", included: true },
        { name: "Advanced code reviews", included: true },
        { name: "Email support", included: true },
        { name: "Advance Analytics", included: true },
        { name: "Priority Support", included: true }
    ]
}

const SubscriptionPage = () => {
    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [portalLoading, setPortalLoading] = useState(false)
    const [syncLoading, setSyncLoading] = useState(false)
    const searchParams = useSearchParams()
    const success = searchParams.get("success")

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['subscription-data'],
        queryFn: getSubscriptionData,
        refetchOnWindowFocus: true
    })

    useEffect(() => {
        if(success === "true"){
            const sync = async() => {
                try{
                    await syncSubscriptionStatus()
                    toast.success("Plan upgraded to Pro, Reflecting changes...")
                    refetch()
                }
                catch(error){
                    console.log("Failed to sync subscription on success return", error)
                }
            }
            sync()
        }
    }, [success, refetch])

    if(!data?.user){
        return (
            <div>
                <h1>Please Sign in to view subscription plans</h1>
            </div>
        )
    }

    const currentTier = data.user.subscriptionTier as "FREE" | "PRO"
    const isPro = currentTier === "PRO"
    const isActive = data.user.subscriptionStatus === "ACTIVE"

    const handleSync = async () => {
        try {
            setSyncLoading(true)
            const result = await syncSubscriptionStatus()
            if (result.success) {
                toast.success("Successfully synced subscription data")
                refetch()
            } else {
                toast.error("Failed to sync data")
            }
        } catch (error) {
            toast.error("Failed to sync data")
            console.log("Failed to sync data -> ", error)
        } finally {
            setSyncLoading(false)
        }

    }

    const handleUpgrade = async () => {
        try {
            setCheckoutLoading(true)

            const res = await fetch('/api/auth/checkout', {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({ slug: "this-is-best" })
            });

            if(res.redirected){
                window.location.href = res.url;
                return;
            }

            const data = await res.json()
            window.location.href = data.url
        } catch (error) {
            console.log("Failed to initiate checkout", error)
            setCheckoutLoading(false)
        } finally {
            setCheckoutLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        try {
            setPortalLoading(true)
             const res = await fetch('/api/auth/portal', {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({ slug: "this-is-best" })
            });

            if(res.redirected){
                window.location.href = res.url;
                return;
            }

            const data = await res.json()
            window.location.href = data.url
        } catch (error) {
            console.log("Failed to open portal : ", error)
            setPortalLoading(false)
        } {
            setPortalLoading(false)
        }
    }

    if (isLoading) {
        <div>
            <h1>
                Loading data....
            </h1>
        </div>
    }

    if (error) {
        <div>
            <h1>Error while fetching data</h1>
        </div>
    }


    return (
        <div>
            <div>
                <div className='flex items-center justify-between'>
                    <div className="py-5 ml-5">
                        <h1 className="text-3xl font-bold">Subscription Plans</h1>
                        <p>Choose the perfect plan for your needs</p>
                    </div>
                    <div className='mr-5'><Button onClick={handleSync} disabled={syncLoading}><RefreshCcw />Sync Data</Button></div>
                </div>
            </div>
            <div className='px-4'>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Usage</CardTitle>
                            <p className='font-light text-sm'>Your current plan limts and usage</p>
                        </CardHeader>
                        <CardContent>
                            <div className='flex items-center gap-30'>
                                <div className='w-[50%]'>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>Repositories</div>
                                        <div>{isPro ? "Unlimited" :<Badge>{data.limits?.repositories.current}/{data.limits?.repositories.limit}</Badge>}</div>
                                    </div>
                                    <Progress value={data.limits.repositories.current * (20)} className='w-[100%]' />
                                </div>
                                <div className='w-full'>
                                    <div>Reviews per Repository</div>
                                    <div>{
                                        isPro ? (<div><p>Pro Tier allows unlimited reviews per repository</p></div>):(<div className="flex items-center justify-between"><p className='text-sm text-light'>Free Tier allows limited reviews per repository</p><p>{data.limits.repositories.limit} per repository</p></div>)
                                    }</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex w-full items-center justify-between gap-3 mt-5">
                    <Card className={data?.limits?.tier === "FREE" ? "w-[50%] border-blue-500 border-2" : "w-[50%]"}>
                        <CardHeader className='flex justify-between'>
                            <div>
                                <CardTitle>Free</CardTitle>
                                <CardDescription>Perfect for getting started</CardDescription>
                            </div>
                            <div>
                                {!isPro && <Badge variant={"default"}>Current Plan</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div><span className="text-[40px] font-bold">$0</span>/month</div>
                            <div>{
                                PLAN_FEATURES.free.map((feature, index) => (<div key={index} className='flex gap-2 mt-2 mb-2 font-bold'>
                                    <div>{feature.included ? <Check /> : <X />}</div>
                                    <div>{feature.name}</div>
                                </div>))
                            }</div>
                            <Button className='w-full mt-5 text-md' variant={"outline"}>Current plan</Button>
                        </CardContent>
                    </Card>
                    <Card className={currentTier === "PRO" ? "w-[50%] border-blue-500 border-2" : "w-[50%]"}><CardHeader className='flex justify-between'>
                        <div>
                            <CardTitle>PRO</CardTitle>
                            <CardDescription>For professional developers</CardDescription>
                        </div>
                        <div>
                            {isPro && <Badge variant={"default"}>Current Plan</Badge>}
                        </div>
                    </CardHeader>
                        <CardContent>
                            <div><span className="text-[40px] font-bold">$99.99</span>/month</div>
                            <div>{
                                PLAN_FEATURES.pro.map((feature, index) => (<div key={index} className='flex gap-2 mt-2 mb-2 font-bold'>
                                    <div>{feature.included ? <Check /> : <X />}</div>
                                    <div>{feature.name}</div>
                                </div>))
                            }</div>
                            <div>
                                {
                                    isPro && isActive ? (<>
                                    <Button className='w-full mt-5 text-md' onClick={handleManageSubscription} disabled={portalLoading}>
                                        {
                                            portalLoading ? (<>Openning Portal...</>) : (<>Manage Subscriptions <ExternalLink/></>)
                                        }
                                    </Button>
                                    </>) : (<><Button className='w-full mt-5 text-md' onClick={handleUpgrade} disabled={checkoutLoading}>
                                        {
                                            checkoutLoading ? (<>Loading Checkout...</>) : (<>Upgrade to Pro</>)
                                        }
                                        </Button></>)
                                }
                            </div>
                        </CardContent></Card>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionPage
