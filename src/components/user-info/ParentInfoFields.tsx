
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, FormItem, FormLabel, FormControl, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserInfoFormValues } from '@/utils/formSchemas';

interface ParentInfoFieldsProps {
  form: UseFormReturn<UserInfoFormValues>;
}

const ParentInfoFields: React.FC<ParentInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormField
            control={form.control}
            name="parentFirstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Parent First Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormField
            control={form.control}
            name="parentLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Parent Last Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="parentEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-medium">Parent Email *</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="email"
                className="bg-white border border-gray-300 h-12 rounded-sm text-gray-800" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ParentInfoFields;
