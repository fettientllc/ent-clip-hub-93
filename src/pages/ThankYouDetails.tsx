
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Home, CloudOff, Cloud } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const ThankYouDetails: React.FC = () => {
  const location = useLocation();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<'success' | 'error' | 'unknown'>('unknown');
  const [dropboxStatus, setDropboxStatus] = useState<'success' | 'error' | 'pending' | 'unknown'>('unknown');
  const [supabaseStatus, setSupabaseStatus] = useState<'success' | 'error' | 'unknown'>('unknown');

  useEffect(() => {
    // Parse the submission state from the location
    const state = location.state as any;
    if (state?.submissionId) {
      setSubmissionId(state.submissionId);
    }
    
    // Parse the different storage statuses
    if (state?.cloudinarySuccess) {
      setCloudinaryStatus('success');
    } else if (state?.cloudinaryError) {
      setCloudinaryStatus('error');
    }
    
    if (state?.dropboxSuccess) {
      setDropboxStatus('success');
    } else if (state?.dropboxError) {
      setDropboxStatus('error');
    } else if (state?.dropboxPending) {
      setDropboxStatus('pending');
    }
    
    if (state?.supabaseSuccess) {
      setSupabaseStatus('success');
    } else if (state?.supabaseError) {
      setSupabaseStatus('error');
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Thank You For Your Submission!</h1>
            <p className="text-gray-600 mt-2">
              Your video has been received and is being processed.
            </p>
            {submissionId && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Submission ID: {submissionId}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800">Submission Status</h2>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col space-y-3">
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Primary Storage (Cloudinary)</div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`flex items-center gap-1 ${
                          cloudinaryStatus === 'success' 
                            ? "bg-green-100 text-green-800 border-green-300"
                            : cloudinaryStatus === 'error'
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}>
                          {cloudinaryStatus === 'success' ? (
                            <><CheckCircle className="h-3 w-3" /> <span>Uploaded</span></>
                          ) : cloudinaryStatus === 'error' ? (
                            <><AlertCircle className="h-3 w-3" /> <span>Failed</span></>
                          ) : (
                            <><AlertCircle className="h-3 w-3" /> <span>Unknown</span></>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {cloudinaryStatus === 'success'
                          ? "Your video was successfully uploaded to our primary storage system."
                          : cloudinaryStatus === 'error'
                            ? "There was an issue uploading your video to our primary storage. We'll try to resolve this issue."
                            : "Status of your upload is unknown."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Backup Storage (Dropbox)</div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`flex items-center gap-1 ${
                          dropboxStatus === 'success' 
                            ? "bg-green-100 text-green-800 border-green-300"
                            : dropboxStatus === 'pending'
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : dropboxStatus === 'error'
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}>
                          {dropboxStatus === 'success' ? (
                            <><Cloud className="h-3 w-3" /> <span>Backed Up</span></>
                          ) : dropboxStatus === 'pending' ? (
                            <><Cloud className="h-3 w-3" /> <span>In Progress</span></>
                          ) : dropboxStatus === 'error' ? (
                            <><CloudOff className="h-3 w-3" /> <span>Failed</span></>
                          ) : (
                            <><AlertCircle className="h-3 w-3" /> <span>Unknown</span></>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {dropboxStatus === 'success'
                          ? "Your video was successfully backed up to our secondary storage system."
                          : dropboxStatus === 'pending'
                            ? "Your video is currently being backed up to our secondary storage system."
                            : dropboxStatus === 'error'
                              ? "There was an issue backing up your video. This won't affect your submission, but we'll try to resolve this issue."
                              : "Status of your backup is unknown."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Database Record</div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`flex items-center gap-1 ${
                          supabaseStatus === 'success' 
                            ? "bg-green-100 text-green-800 border-green-300"
                            : supabaseStatus === 'error'
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}>
                          {supabaseStatus === 'success' ? (
                            <><CheckCircle className="h-3 w-3" /> <span>Recorded</span></>
                          ) : supabaseStatus === 'error' ? (
                            <><AlertCircle className="h-3 w-3" /> <span>Failed</span></>
                          ) : (
                            <><AlertCircle className="h-3 w-3" /> <span>Unknown</span></>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {supabaseStatus === 'success'
                          ? "Your submission details were successfully recorded in our database."
                          : supabaseStatus === 'error'
                            ? "There was an issue recording your submission details. We'll try to resolve this issue."
                            : "Status of your database record is unknown."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>
            
            {(dropboxStatus === 'error' || supabaseStatus === 'error') && cloudinaryStatus === 'success' && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Your submission was received successfully!</strong> However, there were some issues with our backup systems. Don't worry - your video is safely stored in our primary system.
                </AlertDescription>
              </Alert>
            )}
            
            {cloudinaryStatus === 'error' && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>There was an issue with your submission.</strong> Please contact our support team for assistance.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Our team will review your submission. If you have any questions or need to make changes, please contact us.
            </p>
            
            <Link to="/">
              <Button className="bg-[#6C63FF] hover:bg-[#5952cc]">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouDetails;
