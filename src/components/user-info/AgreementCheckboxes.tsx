
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, FormItem, FormControl, FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';
import { UserInfoFormValues } from '@/utils/formSchemas';

interface AgreementCheckboxesProps {
  form: UseFormReturn<UserInfoFormValues>;
}

const AgreementCheckboxes: React.FC<AgreementCheckboxesProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1 border-gray-500"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-gray-700 font-normal text-sm leading-relaxed">
                All of the information submitted through this form is true and accurate and I have reviewed and agree to the Contest Rules, <Link to="/terms" className="text-blue-500 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>
              </label>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="noOtherSubmission"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1 border-gray-500"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-gray-700 font-normal text-sm leading-relaxed">
                I have not submitted this clip or signed any exclusive agreements with anyone else.
              </label>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="keepInTouch"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1 border-gray-500"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-gray-700 font-normal text-sm leading-relaxed">
                Keep me in the know about all things Fetti Ent.
              </label>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default AgreementCheckboxes;
