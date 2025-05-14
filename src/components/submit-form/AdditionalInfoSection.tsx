
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail } from 'lucide-react';
import { SubmitFormValues } from '@/hooks/useSubmitForm';

interface AdditionalInfoSectionProps {
  form: UseFormReturn<SubmitFormValues>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ form }) => {
  // Get values from form to conditionally render sections
  const hasDescription = form.watch('hasDescription');
  const wantCredit = form.watch('wantCredit');
  
  return (
    <div className="space-y-6 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium">Additional Information</h3>
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Where was this filmed?</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="Los Angeles, CA" 
                  {...field} 
                  className="bg-white border-gray-300 text-gray-900 pl-10" 
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-gray-400"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hasDescription"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Add clip description? (optional)</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {hasDescription && (
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us about your clip</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the context, what happens in the video, etc." 
                  className="bg-white border-gray-300 min-h-[100px] text-gray-900"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                A detailed description gives your clip a better chance of being featured
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="isOwnRecording"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Did you record this clip?</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="wantCredit"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Want clip credit? (optional)</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {wantCredit && (
        <div className="space-y-4 pl-2 border-l-2 border-gray-200">
          <FormField
            control={form.control}
            name="creditPlatform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="other">Other...</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="creditUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle or Username to credit</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="@username" 
                      {...field} 
                      className="bg-white border-gray-300 text-gray-900 pl-10" 
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  We'd like to give you credit if your clip is featured.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <FormField
        control={form.control}
        name="paypalEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PayPal Email</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="email@example.com" 
                  type="email"
                  {...field} 
                  className="bg-white border-gray-300 text-gray-900 pl-10" 
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Featured clips can generate earnings for you.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AdditionalInfoSection;
