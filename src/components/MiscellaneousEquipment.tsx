import { useState } from 'react'
import type { MiscEquipment } from '../types'

interface Props {
  items: MiscEquipment[]
  setItems: (items: MiscEquipment[]) => void
}

export default function MiscellaneousEquipment({ items, setItems }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const addItem = () => {
    const newItem: MiscEquipment = {
      type: '',
      serial: '',
      manufacturer: '',
      mfgDate: '',
      lastService: '',
      notes: ''
    }
    setItems([...items, newItem])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleDateFieldChange = (index: number, field: string, value: string) => {
    if (value === 'custom') {
      updateItem(index, field + '_showDateInput', true)
    } else {
      updateItem(index, field, value)
      updateItem(index, field + '_showDateInput', false)
    }
  }

  const handlePhotoUpload = (index: number, file: File | null) => {
    if (file) {
      // Create a new blob URL for the preview
      const previewUrl = URL.createObjectURL(file)
      
      // Update both the file and preview URL
      updateItem(index, 'photo', file)
      updateItem(index, 'photoPreview', previewUrl)
    } else {
      // Clear both file and preview if no file
      updateItem(index, 'photo', undefined)
      updateItem(index, 'photoPreview', undefined)
    }
  }

  return (
    <div className="bg-white rounded-lg p-5 mb-5 shadow-sm">
      <h2 
        className="text-lg font-semibold mb-4 text-red-700 flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        Miscellaneous Equipment
        <span className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
      </h2>
      
      {!isCollapsed && (
        <div>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded bg-gray-50">
                <h3 className="font-semibold mb-3">Equipment #{index + 1}</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-gray-700">Equipment Type</label>
                    <input
                      type="text"
                      value={item.type}
                      onChange={(e) => updateItem(index, 'type', e.target.value)}
                      placeholder="e.g., SCBA, Flashlight, Radio"
                      className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700">Serial Number</label>
                    <input
                      type="text"
                      value={item.serial || ''}
                      onChange={(e) => updateItem(index, 'serial', e.target.value)}
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
                        onChange={(e) => handlePhotoUpload(index, e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {item?.photoPreview && (
                      <div className="mt-3 max-w-xs">
                        <img 
                          src={item.photoPreview} 
                          alt="Tag photo" 
                          className="w-full h-auto rounded border border-gray-300"
                          onError={(e) => {
                            // Handle broken image URLs (cleanup)
                            console.log('Misc equipment image preview error, cleaning up...')
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="mt-1 text-sm text-gray-600">
                          {item.photo?.name} ({((item.photo?.size || 0) / 1024).toFixed(1)} KB)
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700">Manufacturer</label>
                    <input
                      type="text"
                      value={item.manufacturer || ''}
                      onChange={(e) => updateItem(index, 'manufacturer', e.target.value)}
                      placeholder="Enter manufacturer or 'Information Unavailable'"
                      className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-gray-700">Manufacture Date</label>
                      <select
                        value={item.mfgDate || ''}
                        onChange={(e) => handleDateFieldChange(index, 'mfgDate', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 bg-white"
                      >
                        <option value="">Select Date</option>
                        <option value="Information Unavailable">Information Unavailable</option>
                        <option value="custom">Select Custom Date...</option>
                      </select>
                      {item.mfgDate_showDateInput && (
                        <input
                          type="date"
                          onChange={(e) => updateItem(index, 'mfgDate', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 mt-2"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-gray-700">Last Serviced</label>
                      <select
                        value={item.lastService || ''}
                        onChange={(e) => handleDateFieldChange(index, 'lastService', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 bg-white"
                      >
                        <option value="">Select Date</option>
                        <option value="Information Unavailable">Information Unavailable</option>
                        <option value="custom">Select Custom Date...</option>
                      </select>
                      {item.lastService_showDateInput && (
                        <input
                          type="date"
                          onChange={(e) => updateItem(index, 'lastService', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-gray-700">Notes</label>
                    <textarea
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, 'notes', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700 resize-y min-h-[60px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addItem}
            className="mt-3 px-5 py-2.5 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
          >
            <span>+</span> Add Equipment
          </button>
        </div>
      )}
    </div>
  )
}