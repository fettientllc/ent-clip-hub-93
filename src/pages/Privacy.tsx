
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-blue-600/10 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-black">Privacy Policy</h1>
          
          <div className="space-y-6 text-black/90">
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">1. Information We Collect</h2>
              <p>When you submit content to Fetti Ent, we collect personal information such as your name, email address, and social media handles. We also collect the content you submit and metadata associated with it.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">2. How We Use Your Information</h2>
              <p>We use your information to review and potentially feature your content, contact you regarding your submission, and improve our services.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">3. Content Sharing</h2>
              <p>If your content is selected, it may be shared on our social media platforms and website. We may also include your name and social media handles for attribution.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">5. Third-Party Sharing</h2>
              <p>We do not sell your personal information to third parties. We may share selected content with our partners and on our social media platforms.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">6. Cookies and Tracking</h2>
              <p>Our website uses cookies to enhance your browsing experience. You can adjust your browser settings to refuse cookies if you prefer.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">7. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. You may also withdraw your consent for us to use your content at any time, though this will not affect any use that occurred prior to withdrawal.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">8. Children's Privacy</h2>
              <p>We do not knowingly collect information from children under 13. If you are a parent and believe your child has submitted content to us, please contact us.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">9. Policy Updates</h2>
              <p>We may update this policy from time to time. Continued use of our submission platform after changes constitutes acceptance of the updated policy.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-3 text-black">10. Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us through our social media channels.</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
