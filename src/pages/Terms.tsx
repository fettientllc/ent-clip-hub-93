
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-fetti-gray/20 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-fetti-white">Terms and Conditions</h1>
          
          <div className="space-y-6 text-fetti-white/90">
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">1. Submission Guidelines</h2>
              <p>By submitting content to Fetti Ent, you acknowledge that you are the owner of the content or have permission from the copyright holder to submit it.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">2. Content License</h2>
              <p>When you submit content to Fetti Ent, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, distribute, and display your content on our platforms and in our promotional materials.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">3. Content Restrictions</h2>
              <p>Submitted content must not contain any inappropriate, offensive, or illegal material. We reserve the right to reject any submission at our sole discretion.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">4. Age Requirements</h2>
              <p>Users under the age of 13 are not permitted to submit content. Users between 13 and 17 may submit content with parental consent.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">5. Attribution</h2>
              <p>We will make reasonable efforts to credit you when featuring your content, but we cannot guarantee attribution in all cases.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">6. Modification Rights</h2>
              <p>We reserve the right to edit, modify, or adapt your content as needed for our platforms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">7. No Guarantee of Selection</h2>
              <p>We receive many submissions and cannot guarantee that your content will be selected for feature.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">8. Indemnification</h2>
              <p>You agree to indemnify and hold harmless Fetti Ent from any claims arising from your submitted content.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">9. Term Modifications</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of our submission platform constitutes acceptance of any modified terms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-fetti-white">10. Contact</h2>
              <p>For questions regarding these terms, please contact us through our social media channels.</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
