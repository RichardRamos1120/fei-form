import { useState } from 'react'
import type { EquipmentSet } from '../types'

interface EquipmentItemProps {
  name: string
  data: EquipmentSet
  updateField: (type: 'primary' | 'secondary', field: string, value: any) => void
  sizeOptions?: string[]
  sizeType?: 'select' | 'text'
  sizePlaceholder?: string
  hideTitle?: boolean
}

interface Props {
  title: string
  items: EquipmentItemProps[]
}

export default function EquipmentSection({ title, items }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const handleDateFieldChange = (itemUpdateField: Function, type: 'primary' | 'secondary', field: string, value: string) => {
    if (value === 'custom') {
      // Show date input
      itemUpdateField(type, field + '_showDateInput', true)
    } else {
      itemUpdateField(type, field, value)
      itemUpdateField(type, field + '_showDateInput', false)
    }
  }

  const handlePhotoUpload = (itemUpdateField: Function, type: 'primary' | 'secondary', file: File | null) => {
    if (file) {
      // Create a new blob URL for the preview
      const previewUrl = URL.createObjectURL(file)
      
      // Update both the file and preview URL
      itemUpdateField(type, 'photo', file)
      itemUpdateField(type, 'photoPreview', previewUrl)
    } else {
      // Clear both file and preview if no file
      itemUpdateField(type, 'photo', undefined)
      itemUpdateField(type, 'photoPreview', undefined)
    }
  }

  const renderEquipmentForm = (item: EquipmentItemProps, index: number, type: 'primary' | 'secondary') => {
    const equipmentData = item.data[type]
    
    return (
      <div key={`${index}-${type}`} className="space-y-3">
        <div>
          <label className="block mb-1 text-gray-700">Serial Number</label>
          <input
            type="text"
            value={equipmentData.serial || ''}
            onChange={(e) => item.updateField(type, 'serial', e.target.value)}
            placeholder="Enter serial number or 'Information Unavailable'"
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
          />
        </div>

        <div className="p-3 bg-gray-100 rounded border border-gray-300">
          <label className="inline-block px-4 py-2 bg-gray-600 text-white rounded cursor-pointer text-sm hover:bg-gray-700">
            📷 Upload Tag Photo (Optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(item.updateField, type, e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          {equipmentData?.photoPreview && (
            <div className="mt-3 max-w-xs">
              <img 
                src={equipmentData.photoPreview} 
                alt="Tag photo" 
                className="w-full h-auto rounded border border-gray-300"
                onError={(e) => {
                  // Handle broken image URLs (cleanup)
                  console.log('Image preview error, cleaning up...')
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="mt-1 text-sm text-gray-600">
                {equipmentData.photo?.name} ({((equipmentData.photo?.size || 0) / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 text-gray-700">
            Size{item.sizeType === 'text' && item.sizePlaceholder?.includes('Waist') ? ' (Waist x Inseam)' : ''}
          </label>
          {item.sizeType === 'text' || (!item.sizeOptions && !item.sizeType) ? (
            <input
              type="text"
              value={equipmentData.size || ''}
              onChange={(e) => item.updateField(type, 'size', e.target.value)}
              placeholder={item.sizePlaceholder || "Enter size or 'Information Unavailable'"}
              className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
            />
          ) : (
            <select
              value={equipmentData.size || ''}
              onChange={(e) => item.updateField(type, 'size', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 bg-white"
            >
              <option value="">Select Size</option>
              <option value="Information Unavailable">Information Unavailable</option>
              {item.sizeOptions?.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Manufacturer</label>
          <input
            type="text"
            value={equipmentData.manufacturer || ''}
            onChange={(e) => item.updateField(type, 'manufacturer', e.target.value)}
            placeholder="Enter manufacturer or 'Information Unavailable'"
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-gray-700">Manufacture Date</label>
            <select
              value={equipmentData.mfgDate || ''}
              onChange={(e) => handleDateFieldChange(item.updateField, type, 'mfgDate', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 bg-white"
            >
              <option value="">Select Date</option>
              <option value="Information Unavailable">Information Unavailable</option>
              <option value="custom">Select Custom Date...</option>
            </select>
            {equipmentData.mfgDate_showDateInput && (
              <input
                type="date"
                onChange={(e) => item.updateField(type, 'mfgDate', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 mt-2"
              />
            )}
          </div>
          
          <div>
            <label className="block mb-1 text-gray-700">Last Cleaned</label>
            <select
              value={equipmentData.lastCleaned || ''}
              onChange={(e) => handleDateFieldChange(item.updateField, type, 'lastCleaned', e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 bg-white"
            >
              <option value="">Select Date</option>
              <option value="Information Unavailable">Information Unavailable</option>
              <option value="custom">Select Custom Date...</option>
            </select>
            {equipmentData.lastCleaned_showDateInput && (
              <input
                type="date"
                onChange={(e) => item.updateField(type, 'lastCleaned', e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 mt-2"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-gray-700">Notes</label>
          <textarea
            value={equipmentData.notes || ''}
            onChange={(e) => item.updateField(type, 'notes', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 resize-y min-h-[60px]"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg p-5 mb-5 shadow-sm ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 
        className="text-lg font-semibold mb-4 text-red-700 flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {title}
        <span className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
      </h2>
      
      {!isCollapsed && (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded bg-gray-50">
              {!item.hideTitle && (
                <h3 className="font-semibold mb-3">{item.name}</h3>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-blue-200 p-4 rounded bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                    Primary Equipment
                  </h4>
                  {renderEquipmentForm(item, index, 'primary')}
                </div>
                
                <div className="border border-green-200 p-4 rounded bg-green-50">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center">
                    <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                    Secondary Equipment
                  </h4>
                  {renderEquipmentForm(item, index, 'secondary')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}