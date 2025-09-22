'use client'

import { useAuth } from '@/hooks/auth'
import Navigation from '@/app/(financial)/Navigation'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    useEffect(() => {
        if (user && user.systemrole_id !== 2 && user.systemrole_id !== 3) {
            // Not director or employee, redirect to appropriate dashboard
            switch(user.systemrole_id) {
                case 1: // Admin
                    router.push('/admin-dashboard')
                    break
                case 4: // Beneficiary
                    router.push('/dashboard')
                    break
                default:
                    router.push('/dashboard')
            }
        }
    }, [user, router])

    if (!user) {
        return <Loading />
    }

    // Only allow director and employee users
    if (user.systemrole_id !== 2 && user.systemrole_id !== 3) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation user={user} />

            <main>{children}</main>
        </div>
    )
}

export default AppLayout
