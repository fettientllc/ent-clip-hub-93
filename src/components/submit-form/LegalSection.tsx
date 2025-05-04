
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SubmitFormValues } from '@/hooks/useSubmitForm';
import AgreementCheckboxes from '@/components/user-info/AgreementCheckboxes';

interface LegalSectionProps {
  form: UseFormReturn<SubmitFormValues>;
}

const LegalSection: React.FC<LegalSectionProps> = ({ form }) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="font-medium text-gray-900 mb-4">Agreements</h3>
      <AgreementCheckboxes form={form as any} />
      <div className="text-sm text-gray-900 mt-4">
        <p>
          By submitting this form, you agree that all information provided is accurate
          and that you have the rights to share this video content.
        </p>
      </div>
    </div>
  );
};

export default LegalSection;
