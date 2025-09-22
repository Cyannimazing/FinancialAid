'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import Button from '@/components/Button'
import Input from '@/components/Input'
import InputError from '@/components/InputError'
import Label from '@/components/Label'
import Header from '@/components/Header'

const FacilityRegistration = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    
    // Form state
    const [formData, setFormData] = useState({
        center_name: '',
        longitude: '',
        latitude: '',
        description: '',
    })
    
    const [documents, setDocuments] = useState([])
    
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    
    const addDocument = () => {
        setDocuments(prev => [
            ...prev,
            { type: '', file: null, id: Date.now() }
        ])
    }
    
    const removeDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id))
    }
    
    const updateDocument = (id, field, value) => {
        setDocuments(prev => prev.map(doc => 
            doc.id === id ? { ...doc, [field]: value } : doc
        ))
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})
        
        try {
            const submitData = new FormData()
            
            // Add form data
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    submitData.append(key, formData[key])
                }
            })
            
            // Add documents
            documents.forEach((doc, index) => {
                if (doc.type && doc.file) {
                    submitData.append(`documents[${index}][type]`, doc.type)
                    submitData.append(`documents[${index}][file]`, doc.file)
                }
            })
            
            const response = await axios.post('/api/financial-aid', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            
            // Success - redirect to facility dashboard
            router.push('/facility-dashboard')
            
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                console.error('Registration error:', error)
                setErrors({ general: ['Something went wrong. Please try again.'] })
            }
        } finally {
            setIsLoading(false)
        }
    }
    
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                    }))
                },
                (error) => {
                    console.error('Error getting location:', error)
                }
            )
        } else {
            alert('Geolocation is not supported by this browser.')
        }
    }
    
    return (
        <>
            <Header title="Register Facility" />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Facility Registration
                            </h2>
                            
                            {errors.general && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {errors.general[0]}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Center Name */}
                                <div>
                                    <Label htmlFor="center_name">
                                        Facility/Center Name *
                                    </Label>
                                    <Input
                                        id="center_name"
                                        name="center_name"
                                        type="text"
                                        value={formData.center_name}
                                        onChange={handleInputChange}
                                        className="block mt-1 w-full"
                                        required
                                    />
                                    <InputError 
                                        messages={errors.center_name} 
                                        className="mt-2" 
                                    />
                                </div>
                                
                                {/* Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            name="longitude"
                                            type="number"
                                            step="any"
                                            value={formData.longitude}
                                            onChange={handleInputChange}
                                            className="block mt-1 w-full"
                                            placeholder="-180 to 180"
                                        />
                                        <InputError 
                                            messages={errors.longitude} 
                                            className="mt-2" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            name="latitude"
                                            type="number"
                                            step="any"
                                            value={formData.latitude}
                                            onChange={handleInputChange}
                                            className="block mt-1 w-full"
                                            placeholder="-90 to 90"
                                        />
                                        <InputError 
                                            messages={errors.latitude} 
                                            className="mt-2" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <Button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="bg-blue-500 hover:bg-blue-700"
                                    >
                                        Get Current Location
                                    </Button>
                                </div>
                                
                                {/* Description */}
                                <div>
                                    <Label htmlFor="description">
                                        Description (Optional)
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        rows="4"
                                        placeholder="Describe your facility..."
                                    />
                                    <InputError 
                                        messages={errors.description} 
                                        className="mt-2" 
                                    />
                                </div>
                                
                                {/* Documents Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <Label>Supporting Documents (Optional)</Label>
                                        <Button
                                            type="button"
                                            onClick={addDocument}
                                            className="bg-green-500 hover:bg-green-700 text-sm px-3 py-1"
                                        >
                                            Add Document
                                        </Button>
                                    </div>
                                    
                                    {documents.map((doc, index) => (
                                        <div key={doc.id} className="border p-4 rounded-lg mb-4 bg-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-medium">Document #{index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeDocument(doc.id)}
                                                    className="bg-red-500 hover:bg-red-700 text-sm px-2 py-1"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`doc_type_${doc.id}`}>
                                                        Document Type
                                                    </Label>
                                                    <select
                                                        id={`doc_type_${doc.id}`}
                                                        value={doc.type}
                                                        onChange={(e) => updateDocument(doc.id, 'type', e.target.value)}
                                                        className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    >
                                                        <option value="">Select document type</option>
                                                        <option value="business_permit">Business Permit</option>
                                                        <option value="certificate">Certificate</option>
                                                        <option value="license">License</option>
                                                        <option value="registration">Registration</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor={`doc_file_${doc.id}`}>
                                                        Upload File
                                                    </Label>
                                                    <input
                                                        id={`doc_file_${doc.id}`}
                                                        type="file"
                                                        onChange={(e) => updateDocument(doc.id, 'file', e.target.files[0])}
                                                        className="block mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Accepted formats: PDF, JPG, PNG (Max: 2MB)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="bg-gray-500 hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        {isLoading ? 'Registering...' : 'Register Facility'}
                                    </Button>
                                </div>
                                
                                <div className="text-sm text-gray-600 text-center">
                                    <p>* Required fields</p>
                                    <p className="mt-2">
                                        Your facility registration will be reviewed by an administrator 
                                        before approval.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FacilityRegistration