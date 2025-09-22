'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { useState, useEffect } from 'react'
import axios from '@/lib/axios'

const LoginLinks = () => {
    const { user } = useAuth({ middleware: 'guest' })
    const [facilityId, setFacilityId] = useState(null)
    const [isLoadingFacility, setIsLoadingFacility] = useState(false)

    // Fetch facility ID for financial users (Director/Employee)
    useEffect(() => {
        const fetchFacilityId = async () => {
            if (user && (user.systemrole_id === 2 || user.systemrole_id === 3)) {
                setIsLoadingFacility(true)
                try {
                    const response = await axios.get('/api/my-facilities')
                    if (response.data.length > 0) {
                        setFacilityId(response.data[0].id)
                    }
                } catch (error) {
                    console.error('Error fetching facility for LoginLinks:', error)
                } finally {
                    setIsLoadingFacility(false)
                }
            }
        }

        fetchFacilityId()
    }, [user])

    // Function to get dashboard URL based on user role
    const getDashboardUrl = () => {
        if (!user) return '/dashboard'
        
        switch(user.systemrole_id) {
            case 1: // Admin
                return '/admin-dashboard'
            case 2: // Director
                return facilityId ? `/${facilityId}/dashboard` : '/facility-registration'
            case 3: // Employee
                return facilityId ? `/${facilityId}/dashboard` : '/facility-registration'
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
                    {isLoadingFacility ? 'Loading...' : 'Dashboard'}
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
