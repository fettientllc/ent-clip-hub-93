
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
      <FormField
        control={form.control}
        name="signature"
        render={() => (
          <FormItem>
            <FormLabel>Signature</FormLabel>
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
