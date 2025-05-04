
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, FormItem, FormLabel, FormControl, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserInfoFormValues } from '@/utils/formSchemas';

interface PersonalInfoFieldsProps {
  form: UseFormReturn<UserInfoFormValues>;
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">First Name *</FormLabel>
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
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Last Name *</FormLabel>
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-medium">Email *</FormLabel>
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

export default PersonalInfoFields;
