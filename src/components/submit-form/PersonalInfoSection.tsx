
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, FormItem, FormLabel, FormControl, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitFormValues } from '@/hooks/useSubmitForm';

interface PersonalInfoSectionProps {
  form: UseFormReturn<SubmitFormValues>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Personal Information</h3>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-bold">First Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John" 
                  {...field} 
                  className="bg-white border-gray-300 text-gray-900" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-bold">Last Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Doe" 
                  {...field} 
                  className="bg-white border-gray-300 text-gray-900" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black font-bold">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="johndoe@example.com" 
                type="email"
                {...field} 
                className="bg-white border-gray-300 text-gray-900" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalInfoSection;
