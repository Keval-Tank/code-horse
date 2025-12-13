"use client"
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { getUserProfile, updateUserProfile } from '../actions'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const ProfileForm = () => {
    const queryClient = useQueryClient()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => await getUserProfile(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        if (profile) {
            setName(profile.name || " ")
            setEmail(profile.email || " ")
        }
    }, [profile])

    const updateMutation = useMutation({
        mutationFn: async (data: { name: string, email: string }) => {
            return await updateUserProfile(data)
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Updated profile successfully")
                queryClient.invalidateQueries({ queryKey: ['user-profile'] })
            }
        },
        onError: () => toast.error("Failed to update profile")
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({ name, email })
    }
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className='font-bold text-lg'>Profile Settings</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Label className='mb-2'>Full Name</Label>
                        <Input placeholder='' value={name} onChange={(e) => setName(e.target.value)} className='mb-3'/>
                        <Label className='mb-2'>Email</Label>
                        <Input placeholder='' value={email} onChange={(e) => setName(e.target.value)} className="mb-3"/>
                        <Button type='submit'>Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfileForm