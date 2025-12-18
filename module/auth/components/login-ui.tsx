"use client"
import React from 'react'
import { useState } from 'react'
import { BotIcon, GithubIcon } from 'lucide-react'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Spotlight } from '@/components/ui/Spotlight'
import { cn } from '@/lib/utils'

const LoginUI = () => {
    const [loading, setLoading] = useState(false)

    const handleGithubLogin = async () => {
        try {
            setLoading(true)
            await signIn.social({
                provider: "github"
            })
        } catch (err) {
            setLoading(false)
            console.log("Login error : ", err)
        }
    }
    return (
        <div className='flex'>
            {/* <div className="flex items-center justify-between">
                <div className='flex flex-col justify-center items-center'>
                    <div className='p-5 ml-9'>
                        <div className='flex mt-[200px] text-white gap-3 items-center'>
                            <BotIcon className='stroke-[1.8] size-[50px]' />
                            <h1 className='text-4xl font-bold'>
                                Code Horse
                            </h1>
                        </div>
                        <div className="text-white text-6xl mt-[5rem]">
                            <p>Cut Code Review</p>
                            <p>Time & Bugs in Half.</p>
                            <p>Instantly.</p>
                        </div>
                        <div className="mt-[2rem]">
                            <p className='text-gray-500'>
                                Supercharge your team to ship faster with the most advanced AI code reviews.
                            </p>
                        </div>
                    </div>
                </div>
                <div className='p-5 mr-[400px] flex justify-center items-center'>
                    <div className='mt-[5rem]'>
                        <div className='mb-9'>
                            <h1 className='text-5xl text-white'>Welcome Back</h1>
                            <p className='text-white text-md'>Login using Github</p>
                        </div>
                        <div>
                            <Button className='h-max mb-5 w-[500px]' onClick={handleGithubLogin}>
                                <div className='flex justify-center item-center gap-2 p-3'>
                                    <GithubIcon className='size-[30px] ' />
                                    <span className='text-2xl'>{loading ? "Signing in..." : "GitHub"}</span>
                                </div>
                            </Button>
                        </div>
                        <div className='flex justify-center gap-6 mt-[100px]'>
                            <Link href="#" className='text-md'>Terms of use</Link>
                            <span className='text-md'>and</span>
                            <Link href="#" className='text-md'>Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </div> */}
            <div className="relative flex h-screen w-full items-center justify-center bg-white dark:bg-black">
                <div className="h-screen w-full z-10 "><div className='p-5 ml-9'>
                    <div className='ml-35'>
                        <div className='flex mt-[200px] text-white gap-3 items-center'>
                            <BotIcon className='stroke-[1.8] size-[50px]' />
                            <h1 className='text-4xl font-bold'>
                                Code Horse
                            </h1>
                        </div>
                        <div className="text-white text-6xl mt-[5rem]">
                            <p>Cut Code Review</p>
                            <p>Time & Bugs in Half.</p>
                            <p>Instantly.</p>
                        </div>
                        <div className="mt-[2rem]">
                            <p className='text-gray-500'>
                                Supercharge your team to ship faster with the most advanced AI code reviews.
                            </p>
                        </div>
                    </div>

                </div></div>
                <div className='h-screen w-full z-10'><div className='mt-[5rem]'>

                    <div className='w-full flex items-center justify-center'>
                        <div className='mb-9 mt-[20%]'>
                            <h1 className='text-5xl text-white'>Welcome Back</h1>
                            <p className='text-white text-md mb-5'>Login using Github</p>
                            <div>
                                <Button className='h-max mb-5 w-[500px]' onClick={handleGithubLogin}>
                                    <div className='flex justify-center item-center gap-2 p-3'>
                                        <GithubIcon className='size-[30px] ' />
                                        <span className='text-2xl'>{loading ? "Signing in..." : "GitHub"}</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-center gap-6 mt-[50px]'>
                        <Link href="#" className='text-md'>Terms of use</Link>
                        <span className='text-md'>and</span>
                        <Link href="#" className='text-md'>Privacy Policy</Link>
                    </div>
                </div></div>
                <div
                    className={cn(
                        "absolute inset-0",
                        "[background-size:40px_40px]",
                        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
                    )}
                />
            </div>

        </div>
    )
}

export default LoginUI