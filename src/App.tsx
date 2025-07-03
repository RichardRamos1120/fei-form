import { useState } from 'react'
import FirefighterInfo from './components/FirefighterInfo'
import EquipmentSection from './components/EquipmentSection'
import MiscellaneousEquipment from './components/MiscellaneousEquipment'
import type { FormData } from './types'
import { uploadEquipmentImages } from './services/imageUpload'
import { submitEquipmentInventory } from './services/firestore'

function App() {
  const [formData, setFormData] = useState<FormData>({
    firefighterInfo: {
      firefighterName: '',
      firefighterId: '',
      rank: '',
      department: ''
    },
    jacketShell: { primary: {}, secondary: {} },
    jacketLiner: { primary: {}, secondary: {} },
    pantsShell: { primary: {}, secondary: {} },
    pantsLiner: { primary: {}, secondary: {} },
    helmet: { primary: {}, secondary: {} },
    hood: { primary: {}, secondary: {} },
    gloves: { primary: {}, secondary: {} },
    boots: { primary: {}, secondary: {} },
    miscEquipment: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  const resetForm = () => {
    // Clean up any existing blob URLs to prevent memory leaks
    const cleanupBlobUrls = (obj: any) => {
      if (obj && typeof obj === 'object') {
        Object.values(obj).forEach((value: any) => {
          if (typeof value === 'string' && value.startsWith('blob:')) {
            URL.revokeObjectURL(value)
          } else if (value && typeof value === 'object') {
            cleanupBlobUrls(value)
          }
        })
      }
    }
    
    cleanupBlobUrls(formData)
    
    // Reset all file inputs in the form
    const fileInputs = document.querySelectorAll('input[type="file"]')
    fileInputs.forEach((input: any) => {
      input.value = ''
    })
    
    setFormData({
      firefighterInfo: {
        firefighterName: '',
        firefighterId: '',
        rank: '',
        department: ''
      },
      jacketShell: { primary: {}, secondary: {} },
      jacketLiner: { primary: {}, secondary: {} },
      pantsShell: { primary: {}, secondary: {} },
      pantsLiner: { primary: {}, secondary: {} },
      helmet: { primary: {}, secondary: {} },
      hood: { primary: {}, secondary: {} },
      gloves: { primary: {}, secondary: {} },
      boots: { primary: {}, secondary: {} },
      miscEquipment: []
    })
    setSubmitStatus({ type: null, message: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset status
    setSubmitStatus({ type: null, message: '' })
    setIsSubmitting(true)
    
    try {
      // Step 1: Validate required fields
      if (!formData.firefighterInfo.firefighterName.trim()) {
        throw new Error('Firefighter name is required')
      }
      if (!formData.firefighterInfo.firefighterId.trim()) {
        throw new Error('Firefighter ID is required')
      }

      console.log('Starting submission process for:', formData.firefighterInfo.firefighterName)
      
      // Step 2: Collect all images from the form
      const imagesToUpload: Array<{ file: File; fieldId: string }> = []
      
      // Equipment images (primary and secondary)
      const equipmentTypes = ['jacketShell', 'jacketLiner', 'pantsShell', 'pantsLiner', 'helmet', 'hood', 'gloves', 'boots'] as const
      
      equipmentTypes.forEach(equipmentType => {
        ['primary', 'secondary'].forEach(subtype => {
          const equipment = formData[equipmentType][subtype as 'primary' | 'secondary']
          if (equipment.photo instanceof File) {
            imagesToUpload.push({
              file: equipment.photo,
              fieldId: `${equipmentType}_${subtype}_photo`
            })
          }
        })
      })
      
      // Miscellaneous equipment images
      formData.miscEquipment.forEach((item, index) => {
        if (item.photo instanceof File) {
          imagesToUpload.push({
            file: item.photo,
            fieldId: `misc_${index}_photo`
          })
        }
      })

      console.log(`Found ${imagesToUpload.length} images to upload`)
      
      // Step 3: Upload images to Firebase Storage
      let imageUrls: Record<string, string> = {}
      
      if (imagesToUpload.length > 0) {
        setSubmitStatus({ type: null, message: 'Uploading images...' })
        
        const uploadResults = await uploadEquipmentImages(
          imagesToUpload,
          formData.firefighterInfo.firefighterId.trim()
        )
        
        // Convert upload results to URL mapping
        imageUrls = Object.entries(uploadResults).reduce((acc, [fieldId, result]) => {
          acc[fieldId] = result.url
          return acc
        }, {} as Record<string, string>)
        
        console.log('Images uploaded successfully:', Object.keys(imageUrls))
      }
      
      // Step 4: Submit form data with image URLs to Firestore
      setSubmitStatus({ type: null, message: 'Saving equipment inventory...' })
      
      const documentId = await submitEquipmentInventory(formData, imageUrls)
      
      console.log('Equipment inventory submitted successfully:', documentId)
      
      // Step 5: Show success message
      setSubmitStatus({
        type: 'success',
        message: `Equipment inventory submitted successfully! Document ID: ${documentId}`
      })
      
      // Step 6: Clear form after successful submission
      setTimeout(() => {
        resetForm()
      }, 3000) // Clear form after 3 seconds to allow user to see success message
      
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateEquipmentField = (section: keyof FormData, type: 'primary' | 'secondary', field: string, value: any) => {
    if (section === 'miscEquipment') return // Misc equipment handled separately
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: {
          ...(prev[section] as any)[type],
          [field]: value
        }
      }
    }))
  }

  const updateFirefighterInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      firefighterInfo: { ...prev.firefighterInfo, [field]: value }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-5">
        <div className="bg-red-700 text-white p-5 text-center -mx-5 -mt-5 mb-5">
          <h1 className="text-2xl font-semibold">Firefighter Equipment Inventory</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <FirefighterInfo
            data={formData.firefighterInfo}
            updateField={updateFirefighterInfo}
          />

          <EquipmentSection
            title="Structure Jacket"
            items={[
              {
                name: "Jacket Shell",
                data: formData.jacketShell,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('jacketShell', type, field, value),
                sizeOptions: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
              },
              {
                name: "Jacket Liner",
                data: formData.jacketLiner,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('jacketLiner', type, field, value),
                sizeOptions: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
              }
            ]}
          />

          <EquipmentSection
            title="Structure Pants"
            items={[
              {
                name: "Pants Shell",
                data: formData.pantsShell,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('pantsShell', type, field, value),
                sizeType: 'text',
                sizePlaceholder: 'e.g., 34x32 or "Information Unavailable"'
              },
              {
                name: "Pants Liner",
                data: formData.pantsLiner,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('pantsLiner', type, field, value),
                sizeType: 'text',
                sizePlaceholder: 'e.g., 34x32 or "Information Unavailable"'
              }
            ]}
          />

          <EquipmentSection
            title="Helmet"
            items={[
              {
                name: "Helmet",
                data: formData.helmet,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('helmet', type, field, value),
                sizeType: 'text',
                sizePlaceholder: 'Enter size or "Information Unavailable"',
                hideTitle: true
              }
            ]}
          />

          <EquipmentSection
            title="Protective Hood"
            items={[
              {
                name: "Hood",
                data: formData.hood,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('hood', type, field, value),
                sizeOptions: ['Universal', 'S/M', 'L/XL', '2XL/3XL'],
                hideTitle: true
              }
            ]}
          />

          <EquipmentSection
            title="Protective Gloves"
            items={[
              {
                name: "Gloves",
                data: formData.gloves,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('gloves', type, field, value),
                sizeOptions: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
                hideTitle: true
              }
            ]}
          />

          <EquipmentSection
            title="Protective Boots"
            items={[
              {
                name: "Boots",
                data: formData.boots,
                updateField: (type: 'primary' | 'secondary', field: string, value: any) => updateEquipmentField('boots', type, field, value),
                sizeType: 'text',
                sizePlaceholder: 'e.g., 10.5 or "Information Unavailable"',
                hideTitle: true
              }
            ]}
          />

          <MiscellaneousEquipment
            items={formData.miscEquipment}
            setItems={(items) => setFormData(prev => ({ ...prev, miscEquipment: items }))}
          />

          {/* Status Messages */}
          {submitStatus.message && (
            <div className={`p-4 rounded mb-5 ${
              submitStatus.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : submitStatus.type === 'error'
                ? 'bg-red-100 border border-red-400 text-red-700'
                : 'bg-blue-100 border border-blue-400 text-blue-700'
            }`}>
              <div className="flex items-center">
                {submitStatus.type === 'success' && (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {submitStatus.type === 'error' && (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {!submitStatus.type && (
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span className="font-medium">{submitStatus.message}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-5">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className={`flex-1 p-4 rounded text-lg transition-colors ${
                isSubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Clear Form
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 p-4 rounded text-lg transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-red-700 text-white hover:bg-red-800'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Submit Equipment Inventory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App