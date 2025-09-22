'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import Header from '@/components/Header'
import Loading from '@/components/Loading'

const RolesPage = () => {
    const router = useRouter()
    const { facility_id } = useParams()
    const [facility, setFacility] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const response = await axios.get('/api/my-facilities')
                if (response.data.length > 0) {
                    const userFacility = response.data[0]
                    // Verify that the facility_id matches the id
                    if (userFacility.id?.toString() === facility_id) {
                        setFacility(userFacility)
                    } else {
                        setError('Facility not found or access denied')
                    }
                } else {
                    setError('No facility found')
                }
            } catch (error) {
                console.error('Error fetching facility:', error)
                setError('Failed to load facility data')
            } finally {
                setIsLoading(false)
            }
        }
        
        if (facility_id) {
            fetchFacility()
        }
    }, [facility_id])

    if (isLoading) {
        return (
            <>
                <Header title="Role Management" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Loading />
                    </div>
                </div>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Header title="Role Management" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200 text-center">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={() => router.push('/facility-registration')}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Register Facility
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header title="Role Management" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Facility Info */}
                    {facility && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Role Management for: {facility.center_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Facility ID: {facility.id} | Center ID: {facility.center_id}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="text-center py-12">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Role Management
                                </h2>
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                                        🚧 Under Development
                                    </h3>
                                    <p className="text-yellow-700 mb-4">
                                        Working for now... This feature is currently being developed and will be available soon.
                                    </p>
                                    <div className="text-sm text-yellow-600">
                                        <p className="mb-2"><strong>Planned Features:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 text-left">
                                            <li>Create and manage user roles</li>
                                            <li>Assign permissions to roles</li>
                                            <li>Role-based access control</li>
                                            <li>Facility-specific role management</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="mt-8">
                                    <button
                                        onClick={() => router.push(`/${facility_id}/dashboard`)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
                                    >
                                        Back to Dashboard
                                    </button>
                                    <button
                                        onClick={() => router.push(`/${facility_id}/employees`)}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        View Employees
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RolesPage