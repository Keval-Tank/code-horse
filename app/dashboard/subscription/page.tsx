"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { syncSubscriptionStatus } from '@/module/payments/action'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionData } from '@/module/payments/action'


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

    const {data, isLoading, error ,refetch} = useQuery({
        queryKey : ['subscription-data'],
        queryFn : getSubscriptionData,
        refetchOnWindowFocus : true
    })

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
        } finally {
            setSyncLoading(false)
        }

    }

    const handleUpgrade = async () => {
        try {
            setCheckoutLoading(true)

            await fetch('/api/auth/checkout', {
                method: "POST",
                body: JSON.stringify({ slug: "pro" })
            });
        } catch (error) {
            console.log("Failed to initiate checkout", error)
            setCheckoutLoading(false)
        }finally{
            setCheckoutLoading(false)
        }
    }

    const handleManageSubscription = async () => {
        try {
            setPortalLoading(true)
            await fetch("/api/auth/customer/portal", {
                method: "POST"
            })
        } catch (error) {
            console.log("Failed to open portal : ", error)
            setPortalLoading(false)
        }{
            setPortalLoading(false)
        }
    }

    if(isLoading){
        <div>
            <h1>
                Loading data....
            </h1>
        </div>
    }

    if(error){
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
                    <div className='mr-5'><Button>Sync Data</Button></div>
                </div>
            </div>
            <div>

            </div>
        </div>
    )
}

export default SubscriptionPage
