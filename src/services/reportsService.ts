import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  userId: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  category: string;
  title: string;
  confidence: number;
  verified: boolean;
  spam: boolean;
  createdAt: Date;
}

export interface VerificationResult {
  isValid: boolean;
  category: "pothole" | "waste" | "water" | "other" | "invalid";
  title: string;
  confidence: number;
  isSpam: boolean;
  reason: string;
}

// Convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Verify hazard image using Gemini AI
export const verifyHazardImage = async (
  imageBlob: Blob,
  latitude: number,
  longitude: number
): Promise<VerificationResult> => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  // Convert image to base64 for direct AI analysis
  const imageBase64 = await blobToBase64(imageBlob);

  const response = await fetch('https://fnmoxwgndjikjqqphfuc.supabase.co/functions/v1/verify-hazard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64, latitude, longitude }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Verify hazard error details:', error);
    throw new Error(error.details || error.error || 'AI verification failed');
  }

  return response.json();
};

// Upload image to Supabase Storage
export const uploadReportImage = async (imageBlob: Blob, userId: string | null): Promise<string> => {
  const folder = userId || `anon-${Date.now()}`;
  const fileName = `${folder}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('report-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }

  // Get the public URL for the uploaded image
  const { data: urlData } = supabase.storage
    .from('report-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

// Create a new report in Supabase
export const createReport = async (report: {
  userId: string | null;
  imageUrl: string;
  latitude: number;
  longitude: number;
  category?: string;
  title?: string;
  confidence?: number;
  verified?: boolean;
  spam?: boolean;
}): Promise<string> => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: report.userId,
      image_url: report.imageUrl,
      latitude: report.latitude,
      longitude: report.longitude,
      category: report.category || 'pending',
      title: report.title || 'Pending Verification',
      confidence: report.confidence || 0,
      verified: report.verified || false,
      is_spam: report.spam || false,
      status: 'verified'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Create report error:', error);
    throw new Error('Failed to create report');
  }

  return data.id;
};

// Update a report after AI verification
export const updateReportWithVerification = async (
  reportId: string,
  verification: VerificationResult
): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .update({
      category: verification.category,
      title: verification.title,
      confidence: verification.confidence,
      verified: verification.isValid && !verification.isSpam,
      is_spam: verification.isSpam,
      reason: verification.reason,
      status: verification.isSpam ? 'rejected' : 'verified'
    })
    .eq('id', reportId);

  if (error) {
    console.error('Update report error:', error);
    throw new Error('Failed to update report');
  }
};

// Fetch verified reports (for map display)
export const fetchVerifiedReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('verified', true)
    .eq('is_spam', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch reports error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id || '',
    imageUrl: row.image_url,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    category: row.category,
    title: row.title,
    confidence: row.confidence || 0,
    verified: row.verified || false,
    spam: row.is_spam || false,
    createdAt: new Date(row.created_at),
  }));
};

// Subscribe to verified reports in real-time (for map display)
export const subscribeToVerifiedReports = (
  callback: (reports: Report[]) => void
): (() => void) => {
  // Initial fetch
  fetchVerifiedReports().then(callback);

  // Subscribe to changes
  const channel = supabase
    .channel('reports-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reports',
      },
      () => {
        // Refetch on any change
        fetchVerifiedReports().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Fetch all reports (for admin/moderation)
export const fetchAllReports = async (): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch all reports error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id || '',
    imageUrl: row.image_url,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    category: row.category,
    title: row.title,
    confidence: row.confidence || 0,
    verified: row.verified || false,
    spam: row.is_spam || false,
    createdAt: new Date(row.created_at),
  }));
};

// Subscribe to all reports (for admin/moderation)
export const subscribeToAllReports = (
  callback: (reports: Report[]) => void
): (() => void) => {
  // Initial fetch
  fetchAllReports().then(callback);

  // Subscribe to changes
  const channel = supabase
    .channel('all-reports-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reports',
      },
      () => {
        // Refetch on any change
        fetchAllReports().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Delete a report (admin only)
export const deleteReport = async (reportId: string): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    console.error('Delete report error:', error);
    throw new Error('Failed to delete report');
  }
};

// Update a report (admin only)
export const updateReport = async (
  reportId: string,
  updates: Partial<{
    title: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
    verified: boolean;
    is_spam: boolean;
  }>
): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId);

  if (error) {
    console.error('Update report error:', error);
    throw new Error('Failed to update report');
  }
};

// Mark hazard as completed and delete (admin only)
export const completeHazard = async (reportId: string): Promise<void> => {
  // First update status to 'completed' for logging purposes
  const { error: updateError } = await supabase
    .from('reports')
    .update({ status: 'completed' })
    .eq('id', reportId);

  if (updateError) {
    console.error('Complete hazard update error:', updateError);
    throw new Error('Failed to mark hazard as completed');
  }

  // Then delete the report
  const { error: deleteError } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (deleteError) {
    console.error('Complete hazard delete error:', deleteError);
    throw new Error('Failed to remove completed hazard');
  }
};
