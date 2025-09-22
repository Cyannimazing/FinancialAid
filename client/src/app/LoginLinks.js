'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/auth'

const LoginLinks = () => {
    const { user } = useAuth({ middleware: 'guest' })

    // Function to get dashboard URL based on user role
    const getDashboardUrl = () => {
        if (!user) return '/dashboard'
        
        switch(user.systemrole_id) {
            case 1: // Admin
                return '/admin-dashboard'
            case 2: // Director
                return '/facility-dashboard'
            case 3: // Employee
                return '/facility-dashboard'
            case 4: // Beneficiary
                return '/dashboard'
            default:
                return '/dashboard'
        }
    }

    return (
        <div className="hidden fixed top-0 right-0 px-6 py-4 sm:block">
            {user ? (
                <Link
                    href={getDashboardUrl()}
                    className="ml-4 text-sm text-gray-700 underline"
                >
                    Dashboard
                </Link>
            ) : (
                <>
                    <Link
                        href="/login"
                        className="text-sm text-gray-700 underline"
                    >
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className="ml-4 text-sm text-gray-700 underline"
                    >
                        Register
                    </Link>
                </>
            )}
        </div>
    )
}

export default LoginLinks
