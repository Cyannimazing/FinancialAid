'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import Header from '@/components/Header'
import Button from '@/components/Button'

const Dashboard = () => {
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
                <Header title="Facility Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200 text-center">
                                <p>Loading facility data...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Header title="Facility Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200 text-center">
                                <p className="text-red-600 mb-4">{error}</p>
                                <Button 
                                    onClick={() => router.push('/facility-registration')}
                                    className="bg-blue-500 hover:bg-blue-700"
                                >
                                    Register Facility
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (!facility) {
        return (
            <>
                <Header title="Facility Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200 text-center">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    No Facility Registered
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    You haven't registered a facility yet. Click below to register your facility.
                                </p>
                                <Button 
                                    onClick={() => router.push('/facility-registration')}
                                    className="bg-blue-500 hover:bg-blue-700"
                                >
                                    Register Facility
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header title="Facility Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Facility Information Card */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    My Facility
                                </h2>
                                
                                {!facility.isManagable && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Waiting for Approval
                                                </h3>
                                                <p className="mt-1 text-sm text-yellow-700">
                                                    Your facility is pending admin approval. Some features may be limited until approval.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Facility ID</label>
                                        <p className="text-lg font-semibold text-gray-900">{facility.id}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Center ID</label>
                                        <p className="text-lg font-semibold text-gray-900">{facility.center_id}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Center Name</label>
                                        <p className="text-lg text-gray-900">{facility.center_name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Status</label>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                            facility.isManagable 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {facility.isManagable ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    </div>
                                    
                                    {facility.description && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Description</label>
                                            <p className="text-gray-900">{facility.description}</p>
                                        </div>
                                    )}
                                    
                                    {(facility.latitude && facility.longitude) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Location</label>
                                            <p className="text-gray-900">
                                                Lat: {facility.latitude}, Long: {facility.longitude}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Registration Date</label>
                                        <p className="text-gray-900">
                                            {new Date(facility.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard