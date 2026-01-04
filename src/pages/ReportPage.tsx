import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { uploadReportImage, createReport, verifyHazardImage } from "@/services/reportsService";
import { useNavigate } from "react-router-dom";

type VerificationStatus = 'idle' | 'uploading' | 'verifying' | 'success' | 'rejected' | 'error';

const ReportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [verificationDetails, setVerificationDetails] = useState<{ category?: string; confidence?: number } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get location on mount
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setLocation({ lat: 19.076, lng: 72.8777 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Got location:", position.coords);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location detected!");
      },
      (error) => {
        console.error("Geolocation error:", error.code, error.message);
        toast.error(`Location error: ${error.message}. Using default.`);
        setLocation({ lat: 19.076, lng: 72.8777 });
      },
      {
        enableHighAccuracy: false,  // faster, less accurate
        timeout: 10000,             // 10 seconds timeout
        maximumAge: 60000           // accept cached position up to 1 minute old
      }
    );
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera not supported. Please use the upload option instead.");
        return;
      }

      // First set capturing state to render the video element
      setIsCapturing(true);
      getLocation();

      // Wait a tick for the video element to be in the DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      setIsCapturing(false);
      toast.error("Could not access camera. Please grant permission.");
    }
  }, [getLocation]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedImage(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setCapturedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    getLocation();
  };

  const handleSubmit = async () => {
    if (!capturedImage || !location) {
      toast.error("Missing required data");
      return;
    }

    // Use Firebase user ID if available, otherwise null for anonymous users
    const userId = user?.uid || null;

    setStatus('uploading');
    setVerificationMessage('Uploading image...');

    try {
      // First verify with AI (using the blob directly)
      setStatus('verifying');
      setVerificationMessage('AI is analyzing your image with Gemini...');

      const verification = await verifyHazardImage(capturedImage, location.lat, location.lng);

      if (verification.isSpam) {
        setStatus('rejected');
        setVerificationMessage('Image rejected: ' + verification.reason);
        toast.error("Report rejected", { description: verification.reason });
        return;
      }

      if (!verification.isValid || verification.category === 'invalid') {
        setStatus('rejected');
        setVerificationMessage(verification.reason || 'Not a valid hazard image');
        toast.error("Not a valid hazard", { description: verification.reason });
        return;
      }

      // Upload image to storage after successful verification
      setStatus('uploading');
      setVerificationMessage('Saving verified report...');

      const imageUrl = await uploadReportImage(capturedImage, userId);

      await createReport({
        userId,
        imageUrl,
        latitude: location.lat,
        longitude: location.lng,
        category: verification.category,
        title: verification.title,
        confidence: verification.confidence,
        verified: true,
        spam: false,
      });

      setStatus('success');
      setVerificationMessage(`Verified: ${verification.title}`);
      setVerificationDetails({
        category: verification.category,
        confidence: verification.confidence
      });

      toast.success("Hazard verified and added to map!", {
        description: `${verification.title} - ${verification.category}`,
      });
    } catch (error) {
      console.error("Submit error:", error);
      setStatus('error');
      setVerificationMessage(error instanceof Error ? error.message : 'Verification failed');
      toast.error("Failed to verify report", {
        description: error instanceof Error ? error.message : 'Please try again.'
      });
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setPreviewUrl(null);
    setStatus('idle');
    setVerificationMessage('');
    setVerificationDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing = status === 'uploading' || status === 'verifying';

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'pothole': return 'text-orange-500';
      case 'waste': return 'text-green-500';
      case 'water': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'pothole': return '🕳️ Pothole';
      case 'waste': return '🗑️ Waste/Garbage';
      case 'water': return '💧 Water Pollution';
      case 'other': return '⚠️ Other Hazard';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            disabled={isProcessing}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Report Hazard</h1>
            <p className="text-sm text-muted-foreground">Take a photo or upload an image</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Image Selection Area */}
          {!previewUrl && !isCapturing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Camera Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startCamera}
                  className="aspect-square glass-strong rounded-2xl border border-border/50 flex flex-col items-center justify-center gap-4 hover:border-accent/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-accent" />
                  </div>
                  <span className="font-medium">Take Photo</span>
                  <span className="text-sm text-muted-foreground">Use your camera</span>
                </motion.button>

                {/* Upload Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square glass-strong rounded-2xl border border-border/50 flex flex-col items-center justify-center gap-4 hover:border-accent/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="font-medium">Upload Image</span>
                  <span className="text-sm text-muted-foreground">From your device</span>
                </motion.button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Info Card */}
              <div className="glass rounded-xl p-4 border border-border/50">
                <h3 className="font-medium mb-2">What can you report?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">🕳️</span> Potholes and road damage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">🗑️</span> Garbage and waste accumulation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">💧</span> Water pollution and drainage issues
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">⚠️</span> Other urban hazards
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Camera View */}
          {isCapturing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Scan overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-accent/30 rounded-xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-20 h-20 border-2 border-accent rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCapture}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </motion.div>
          )}

          {/* Preview & Verification */}
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6"
                    >
                      <CheckCircle className="w-20 h-20 text-success mb-4" />
                      <p className="text-success font-semibold text-lg text-center mb-2">
                        Hazard Verified!
                      </p>
                      <p className="text-center text-muted-foreground mb-4">
                        {verificationMessage}
                      </p>
                      {verificationDetails && (
                        <div className="flex items-center gap-4">
                          <span className={`font-medium ${getCategoryColor(verificationDetails.category)}`}>
                            {getCategoryLabel(verificationDetails.category)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {verificationDetails.confidence}% confidence
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ) : status === 'rejected' ? (
                    <motion.div
                      key="rejected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6"
                    >
                      <XCircle className="w-20 h-20 text-destructive mb-4" />
                      <p className="text-destructive font-semibold text-lg text-center mb-2">
                        Not Verified
                      </p>
                      <p className="text-center text-muted-foreground">
                        {verificationMessage}
                      </p>
                    </motion.div>
                  ) : status === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-card p-6"
                    >
                      <AlertTriangle className="w-20 h-20 text-secondary mb-4" />
                      <p className="text-secondary font-semibold text-lg text-center mb-2">
                        Error
                      </p>
                      <p className="text-center text-muted-foreground">
                        {verificationMessage}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="preview" className="relative w-full h-full">
                      <img
                        src={previewUrl}
                        alt="Captured hazard"
                        className="w-full h-full object-cover"
                      />
                      {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
                          <p className="font-medium">{verificationMessage}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Powered by Gemini AI
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl border border-border/50">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-sm">
                  {location
                    ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : 'Detecting location...'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {status === 'success' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      Report Another
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      View Map
                    </Button>
                  </>
                ) : status === 'rejected' || status === 'error' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1"
                    >
                      Back to Map
                    </Button>
                    <Button
                      onClick={handleReset}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Try Again
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing || !location}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Submit Report
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
