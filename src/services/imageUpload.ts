import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface ImageUploadResult {
  url: string;
  filename: string;
  size: number;
}

/**
 * Upload a single image to Firebase Storage
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'equipment-photos/firefighter-123/')
 * @returns Promise with the uploaded image details
 */
export const uploadImage = async (
  file: File, 
  path: string
): Promise<ImageUploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 10MB for government apps)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 10MB');
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${cleanFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, `${path}${filename}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      filename,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload multiple images for equipment photos
 * @param images - Array of { file: File, fieldId: string }
 * @param firefighterId - ID of the firefighter for organizing storage
 * @returns Promise with mapping of fieldId to upload results
 */
export const uploadEquipmentImages = async (
  images: Array<{ file: File; fieldId: string }>,
  firefighterId: string
): Promise<Record<string, ImageUploadResult>> => {
  const results: Record<string, ImageUploadResult> = {};
  
  try {
    // Create base path for this firefighter's equipment photos
    const basePath = `equipment-photos/${firefighterId}/`;
    
    // Upload all images in parallel
    const uploadPromises = images.map(async ({ file, fieldId }) => {
      const result = await uploadImage(file, basePath);
      results[fieldId] = result;
    });
    
    await Promise.all(uploadPromises);
    
    return results;
  } catch (error) {
    console.error('Error uploading equipment images:', error);
    throw new Error(`Failed to upload equipment images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};