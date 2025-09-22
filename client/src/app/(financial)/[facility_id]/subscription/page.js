'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { useAuth } from '@/hooks/auth'

export default function SubscriptionPage() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { facility_id } = useParams()
    
    const [facility, setFacility] = useState(null)
    const [subscriptions, setSubscriptions] = useState({
        current: null,
        pending: null
    })
    const [availablePlans, setAvailablePlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [subscribing, setSubscribing] = useState(null)

    useEffect(() => {
        if (facility_id) {
            fetchFacilityData()
            fetchSubscriptionData()
            fetchAvailablePlans()
        }
    }, [facility_id])

    const fetchFacilityData = async () => {
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
        }
    }

    const fetchSubscriptionData = async () => {
        try {
            const response = await axios.get('/api/my-subscriptions')
            if (response.data.success) {
                const subs = response.data.data
                
                // Separate current and pending subscriptions
                const current = subs.find(sub => 
                    sub.status === 'Active' && new Date(sub.end_date) >= new Date()
                )
                const pending = subs.find(sub => sub.status === 'Pending')
                
                setSubscriptions({ current, pending })
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
            setError('Failed to load subscription data.')
        }
    }

    const fetchAvailablePlans = async () => {
        try {
            const response = await axios.get('/api/subscription-plans')
            if (response.data.success) {
                // Filter out free plan for purchase options
                const plans = response.data.data.filter(plan => 
                    plan.plan_name.toLowerCase() !== 'free'
                )
                setAvailablePlans(plans)
            }
        } catch (error) {
            console.error('Error fetching plans:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribeToPlan = async (planId) => {
        if (subscriptions.pending) {
            setError('You already have a pending subscription. Only one pending subscription is allowed.')
            return
        }

        setSubscribing(planId)
        setError('')
        setSuccess('')

        try {
            const response = await axios.post('/api/subscribe', {
                plan_id: planId,
                facility_id: facility_id // Include facility_id in the subscription request
            })
            
            if (response.data.success) {
                await fetchSubscriptionData()
                setError('')
                
                // Show success message from server
                if (response.data.message) {
                    setSuccess(response.data.message)
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => setSuccess(''), 5000)
                }
            }
        } catch (error) {
            console.error('Error subscribing to plan:', error)
            const message = error.response?.data?.message || 'Failed to subscribe to plan.'
            setError(message)
        } finally {
            setSubscribing(null)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(price)
    }

    const formatDuration = (months) => {
        if (months === 1) return '1 month'
        if (months < 12) return `${months} months`
        
        const years = Math.floor(months / 12)
        const remainingMonths = months % 12
        
        let duration = years === 1 ? '1 year' : `${years} years`
        if (remainingMonths > 0) {
            duration += remainingMonths === 1 ? ', 1 month' : `, ${remainingMonths} months`
        }
        
        return duration
    }

    const isExpiringSoon = (endDate) => {
        const end = new Date(endDate)
        const now = new Date()
        const diffTime = end - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 30 && diffDays > 0
    }

    const isExpired = (endDate) => {
        return new Date(endDate) < new Date()
    }

    if (loading) {
        return (
            <>
                <Header title="My Subscription" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Loading />
                    </div>
                </div>
            </>
        )
    }

    if (error && !facility) {
        return (
            <>
                <Header title="My Subscription" />
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
            <Header title="My Subscription" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Facility Info */}
                    {facility && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Subscription for: {facility.center_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Facility ID: {facility.id} | Center ID: {facility.center_id}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {success}
                            <button
                                onClick={() => setSuccess('')}
                                className="absolute top-2 right-2 text-green-700 hover:text-green-900"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                            <button
                                onClick={() => setError('')}
                                className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Current Subscription */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Subscription</h2>
                            
                            {subscriptions.current ? (
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {subscriptions.current.subscription_plan?.plan_name || 'Unknown Plan'}
                                            </h3>
                                            <p className="text-2xl font-bold text-green-600 mt-2">
                                                {formatPrice(subscriptions.current.subscription_plan?.price || 0)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                                subscriptions.current.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {subscriptions.current.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Start Date</p>
                                            <p className="font-medium">
                                                {new Date(subscriptions.current.start_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">End Date</p>
                                            <p className={`font-medium ${
                                                isExpired(subscriptions.current.end_date) 
                                                    ? 'text-red-600'
                                                    : isExpiringSoon(subscriptions.current.end_date)
                                                    ? 'text-yellow-600'
                                                    : 'text-gray-900'
                                            }`}>
                                                {new Date(subscriptions.current.end_date).toLocaleDateString()}
                                                {isExpired(subscriptions.current.end_date) && ' (Expired)'}
                                                {isExpiringSoon(subscriptions.current.end_date) && ' (Expiring Soon)'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {subscriptions.current.subscription_plan?.description && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600">Description</p>
                                            <p className="text-gray-800">{subscriptions.current.subscription_plan.description}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No active subscription</p>
                                    <p className="text-sm">Subscribe to a plan to continue using our services.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Subscription */}
                    {subscriptions.pending && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Subscription</h2>
                                
                                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {subscriptions.pending.subscription_plan?.plan_name || 'Unknown Plan'}
                                            </h3>
                                            <p className="text-2xl font-bold text-orange-600 mt-2">
                                                {formatPrice(subscriptions.pending.subscription_plan?.price || 0)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                Pending Activation
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">
                                            This subscription will become active when your current subscription expires or when activated by admin.
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Duration: {formatDuration(subscriptions.pending.subscription_plan?.duration_in_months || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Plans */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
                            
                            {availablePlans.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {availablePlans.map((plan) => (
                                        <div
                                            key={plan.plan_id}
                                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="mb-4">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {plan.plan_name}
                                                </h3>
                                                <div className="text-2xl font-bold text-green-600 mt-2">
                                                    {formatPrice(plan.price)}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    Duration: {formatDuration(plan.duration_in_months)}
                                                </div>
                                            </div>
                                            
                                            {plan.description && (
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                    {plan.description}
                                                </p>
                                            )}
                                            
                                            <button
                                                onClick={() => handleSubscribeToPlan(plan.plan_id)}
                                                disabled={subscribing === plan.plan_id || subscriptions.pending}
                                                className={`w-full px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                                                    subscriptions.pending
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : subscribing === plan.plan_id
                                                        ? 'bg-blue-400 text-white cursor-wait'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                }`}
                                            >
                                                {subscribing === plan.plan_id 
                                                    ? 'Subscribing...' 
                                                    : subscriptions.pending 
                                                    ? 'Pending Subscription Exists'
                                                    : 'Subscribe Now'
                                                }
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No subscription plans available at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Back to Dashboard */}
                    <div className="text-center">
                        <button
                            onClick={() => router.push(`/${facility_id}/dashboard`)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}