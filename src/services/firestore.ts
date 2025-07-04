import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FormData } from '../types';

export interface EquipmentInventoryRecord extends Omit<FormData, 'miscEquipment'> {
  id?: string;
  submittedAt: Date;
  lastUpdated: Date;
  miscEquipment: Array<{
    type: string;
    serial?: string;
    manufacturer?: string;
    model?: string;
    mfgDate?: string;
    notes?: string;
    imageUrl?: string;
  }>;
}

/**
 * Validate form data before submission
 */
const validateFormData = (data: FormData): string[] => {
  const errors: string[] = [];
  
  // Validate required firefighter info
  if (!data.firefighterInfo.firefighterName?.trim()) {
    errors.push('Firefighter name is required');
  }
  
  if (!data.firefighterInfo.firefighterId?.trim()) {
    errors.push('Firefighter ID is required');
  }
  
  // Firefighter ID can contain any characters - no format restrictions
  
  return errors;
};

/**
 * Clean and prepare form data for storage
 */
const cleanFormData = (data: FormData, imageUrls: Record<string, string>): EquipmentInventoryRecord => {
  // Helper function to clean equipment data and add image URL
  const cleanEquipmentData = (equipment: any, imageUrl?: string) => {
    const cleaned: any = {};
    
    // Define allowed fields for equipment data (exclude UI state fields)
    const allowedFields = [
      'serial',
      'size', 
      'manufacturer',
      'model',
      'mfgDate',
      'notes'
    ];
    
    allowedFields.forEach(field => {
      const value = equipment[field];
      // Only include fields that have actual values (not empty strings, undefined, or null)
      if (value && value.trim && value.trim() !== '') {
        cleaned[field] = value.trim();
      } else if (value && typeof value !== 'string') {
        cleaned[field] = value;
      }
      // Omit empty/undefined/null values entirely rather than storing them
    });
    
    // Add image URL if available
    if (imageUrl) {
      cleaned.imageUrl = imageUrl;
    }
    
    return cleaned;
  };

  // Equipment types for processing
  const equipmentTypes = ['jacketShell', 'jacketLiner', 'pantsShell', 'pantsLiner', 'helmet', 'hood', 'gloves', 'boots'] as const;

  // Clean miscellaneous equipment
  const cleanedMiscEquipment = data.miscEquipment.map((item, index) => {
    const cleaned: any = {};
    
    // Always include type (required field)
    cleaned.type = item.type || '';
    
    // Only include other fields if they have values
    if (item.serial && item.serial.trim()) {
      cleaned.serial = item.serial.trim();
    }
    if (item.manufacturer && item.manufacturer.trim()) {
      cleaned.manufacturer = item.manufacturer.trim();
    }
    if (item.model && item.model.trim()) {
      cleaned.model = item.model.trim();
    }
    if (item.mfgDate && item.mfgDate.trim()) {
      cleaned.mfgDate = item.mfgDate.trim();
    }
    if (item.notes && item.notes.trim()) {
      cleaned.notes = item.notes.trim();
    }
    
    // Include image URL if available
    const imageUrl = imageUrls[`misc_${index}_photo`];
    if (imageUrl) {
      cleaned.imageUrl = imageUrl;
    }
    
    return cleaned;
  });

  // Clean firefighter info
  const firefighterInfo: any = {
    firefighterName: data.firefighterInfo.firefighterName.trim(),
    firefighterId: data.firefighterInfo.firefighterId.trim() // Keep original case, no format restrictions
  };
  
  // Only include optional fields if they have values
  if (data.firefighterInfo.rank && data.firefighterInfo.rank.trim()) {
    firefighterInfo.rank = data.firefighterInfo.rank.trim();
  }
  if (data.firefighterInfo.department && data.firefighterInfo.department.trim()) {
    firefighterInfo.department = data.firefighterInfo.department.trim();
  }

  // Build the clean data object with image URLs integrated
  const cleanedData: any = {
    firefighterInfo,
    miscEquipment: cleanedMiscEquipment,
    submittedAt: new Date(),
    lastUpdated: new Date()
  };

  // Process each equipment type with their image URLs
  equipmentTypes.forEach(equipmentType => {
    cleanedData[equipmentType] = {
      primary: cleanEquipmentData(
        data[equipmentType].primary, 
        imageUrls[`${equipmentType}_primary_photo`]
      ),
      secondary: cleanEquipmentData(
        data[equipmentType].secondary, 
        imageUrls[`${equipmentType}_secondary_photo`]
      )
    };
  });

  return cleanedData;
};

/**
 * Submit equipment inventory to Firestore
 */
export const submitEquipmentInventory = async (
  formData: FormData,
  imageUrls: Record<string, string> = {}
): Promise<string> => {
  try {
    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Clean and prepare data
    const cleanedData = cleanFormData(formData, imageUrls);
    
    // Add timestamp fields using server timestamp
    const dataToSubmit = {
      ...cleanedData,
      submittedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    // Submit to Firestore
    const docRef = await addDoc(collection(db, 'equipment-inventories'), dataToSubmit);
    
    console.log('Equipment inventory submitted successfully:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Error submitting equipment inventory:', error);
    throw new Error(`Failed to submit equipment inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get equipment inventory by document ID
 */
export const getEquipmentInventory = async (id: string): Promise<EquipmentInventoryRecord | null> => {
  try {
    const docRef = doc(db, 'equipment-inventories', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EquipmentInventoryRecord;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting equipment inventory:', error);
    throw new Error(`Failed to get equipment inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Update equipment inventory
 */
export const updateEquipmentInventory = async (
  id: string,
  formData: FormData,
  imageUrls: Record<string, string> = {}
): Promise<void> => {
  try {
    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Clean and prepare data
    const cleanedData = cleanFormData(formData, imageUrls);
    
    // Update with server timestamp
    const dataToUpdate = {
      ...cleanedData,
      lastUpdated: serverTimestamp()
    };

    // Update in Firestore
    const docRef = doc(db, 'equipment-inventories', id);
    await updateDoc(docRef, dataToUpdate);
    
    console.log('Equipment inventory updated successfully:', id);
    
  } catch (error) {
    console.error('Error updating equipment inventory:', error);
    throw new Error(`Failed to update equipment inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};