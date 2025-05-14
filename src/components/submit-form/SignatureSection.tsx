
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import SignaturePad from '@/components/SignaturePad';
import { SubmitFormValues } from '@/hooks/useSubmitForm';

interface SignatureSectionProps {
  form: UseFormReturn<SubmitFormValues>;
  handleSignatureChange: (signatureData: string) => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ form, handleSignatureChange }) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium text-black font-bold mb-4">Signature</h3>
      <FormField
        control={form.control}
        name="signature"
        render={() => (
          <FormItem>
            <FormLabel className="text-black font-bold text-base mb-2">Please sign below</FormLabel>
            <FormControl>
              <SignaturePad onSignatureChange={handleSignatureChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SignatureSection;
