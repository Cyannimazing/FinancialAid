'use client'

import { useAuth } from '@/hooks/auth'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import Loading from '@/components/Loading'

const FacilityLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })
    const { facility_id } = useParams()
    const router = useRouter()
    const [facility, setFacility] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const response = await axios.get('/api/my-facilities')
                if (response.data.length > 0) {
                    const userFacility = response.data[0]
                    // Check if the facility_id in URL matches user's facility id
                    if (userFacility.id?.toString() === facility_id) {
                        setFacility(userFacility)
                    } else {
                        // Redirect to correct facility_id using id
                        router.replace(`/${userFacility.id}/dashboard`)
                        return
                    }
                } else {
                    // No facility found, redirect to registration
                    router.replace('/facility-registration')
                    return
                }
            } catch (error) {
                console.error('Error fetching facility:', error)
                setError('Failed to load facility data')
            } finally {
                setIsLoading(false)
            }
        }

        if (user && facility_id) {
            fetchFacility()
        }
    }, [user, facility_id, router])

    if (isLoading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/facility-registration')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Go to Registration
                    </button>
                </div>
            </div>
        )
    }

    if (!facility) {
        return <Loading />
    }

    return (
        <div className="facility-context">
            {children}
        </div>
    )
}

export default FacilityLayout