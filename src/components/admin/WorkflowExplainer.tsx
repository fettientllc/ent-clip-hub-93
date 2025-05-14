
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Upload, Eye, CheckCircle, Database } from 'lucide-react';

const WorkflowExplainer: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Video Review Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium">1. Submission</h3>
            <p className="text-xs text-gray-500 mt-1">User uploads video</p>
          </div>
          
          <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
          <div className="h-6 w-6 md:hidden flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
          </div>
          
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-sm font-medium">2. Temporary Storage</h3>
            <p className="text-xs text-gray-500 mt-1">Video stored temporarily</p>
          </div>
          
          <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
          <div className="h-6 w-6 md:hidden flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
          </div>
          
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium">3. Admin Review</h3>
            <p className="text-xs text-gray-500 mt-1">Admin reviews submission</p>
          </div>
          
          <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
          <div className="h-6 w-6 md:hidden flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
          </div>
          
          <div className="flex flex-col items-center max-w-[150px]">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-sm font-medium">4. Dropbox Upload</h3>
            <p className="text-xs text-gray-500 mt-1">If approved, video is saved to Dropbox</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowExplainer;
