import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  endpoint: 'video' | 'document';
  onUploadComplete: (fileUrl: string) => void;
  accept?: string;
  label: string;
}

export default function FileUpload({ endpoint, onUploadComplete, accept, label }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append(endpoint, file); // Use 'video' or 'document' as the field name

      const response = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setUploadSuccess(true);
      onUploadComplete(data.fileUrl);
      
      toast({
        title: 'Upload successful',
        description: `Your ${endpoint} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Upload failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getAcceptString = () => {
    if (accept) return accept;
    
    if (endpoint === 'video') {
      return '.mp4,.webm,.avi,.mov';
    } else {
      return '.pdf,.doc,.docx,.txt,.ppt,.pptx';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`${endpoint}-upload`}>{label}</Label>
      
      <div className="flex items-center space-x-2">
        <input
          id={`${endpoint}-upload`}
          type="file"
          onChange={handleFileChange}
          accept={getAcceptString()}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(`${endpoint}-upload`)?.click()}
          className="flex-1"
        >
          {file ? file.name : `Select ${endpoint === 'video' ? 'video' : 'document'}`}
        </Button>
        
        <Button 
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="min-w-[100px]"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </div>
      
      {uploadError && (
        <div className="text-sm text-destructive flex items-center mt-1">
          <X className="h-4 w-4 mr-1" />
          {uploadError}
        </div>
      )}
      
      {uploadSuccess && (
        <div className="text-sm text-green-600 flex items-center mt-1">
          <Check className="h-4 w-4 mr-1" />
          Upload successful
        </div>
      )}
    </div>
  );
}