import React from 'react'
import ProfileForm from '@/module/settings/components/profile-form'

const SettingsPage = () => {
    return (
        <div>
            <div>
                <div className="py-5 ml-5">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p>Manage your account and repositories settings</p>
                </div>
            </div>
            <div className="p-3">
                <div>
                    <ProfileForm/>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage