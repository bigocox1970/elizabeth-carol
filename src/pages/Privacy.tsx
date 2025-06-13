import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageSEO } from "@/utils/seo";

const Privacy = () => {
  const seoData = getPageSEO('privacy');

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoData} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your privacy and confidentiality are of utmost importance to Elizabeth Carol's spiritual services.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Elizabeth Carol collects only the information necessary to provide spiritual services and maintain client relationships:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Contact Information:</strong> Name, telephone number, email address, and postal address for booking and communication purposes</li>
                  <li><strong>Appointment Details:</strong> Preferred dates, times, and service types to schedule readings</li>
                  <li><strong>Payment Information:</strong> Details necessary for payment processing (handled securely through approved payment systems)</li>
                  <li><strong>Reading Notes:</strong> Brief notes may be kept to ensure continuity of service (with your consent)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spiritual Reading Confidentiality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Complete Confidentiality:</strong> Everything shared during your spiritual reading is strictly confidential. Elizabeth Carol operates under the highest ethical standards of spiritual practice:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>All messages, conversations, and personal information shared during readings remain completely private</li>
                  <li>No information from your reading will be shared with any third party without your explicit written consent</li>
                  <li>Reading notes (if kept) are stored securely and are never shared or discussed with others</li>
                  <li>Group reading participants are also bound by confidentiality regarding other participants' readings</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your personal information is used solely for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Scheduling and confirming appointments</li>
                  <li>Providing spiritual guidance and mediumship services</li>
                  <li>Processing payments for services rendered</li>
                  <li>Sending appointment reminders and service-related communications</li>
                  <li>Maintaining records for continuity of care (with your consent)</li>
                  <li>Sending occasional newsletters or service updates (only with your explicit consent)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Elizabeth Carol is committed to protecting your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>All personal data is stored securely and protected against unauthorized access</li>
                  <li>Payment information is processed through secure, encrypted systems</li>
                  <li>Physical documents are kept in locked, secure storage</li>
                  <li>Digital information is password-protected and encrypted</li>
                  <li>Regular security reviews ensure continued protection of your data</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Access:</strong> Request to see what personal information we hold about you</li>
                  <li><strong>Correction:</strong> Ask us to correct any inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request a copy of your information in a portable format</li>
                  <li><strong>Withdrawal of Consent:</strong> Withdraw consent for marketing communications at any time</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookies & Website Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This website uses minimal cookies to improve your browsing experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Essential cookies for website functionality</li>
                  <li>Analytics cookies to understand website usage (anonymized data only)</li>
                  <li>No tracking cookies or third-party advertising cookies are used</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Elizabeth Carol may use trusted third-party services for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Payment processing (all transactions are secure and encrypted)</li>
                  <li>Email communications (with appropriate data protection agreements)</li>
                  <li>Website hosting and maintenance</li>
                </ul>
                <p className="text-muted-foreground">
                  All third-party service providers are carefully selected and must meet strict data protection standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Personal information is retained only as long as necessary:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Contact information: Retained while you remain a client and for 7 years after your last appointment</li>
                  <li>Payment records: Retained for 7 years as required by UK tax law</li>
                  <li>Reading notes: Retained only with your consent and for as long as beneficial to your ongoing spiritual journey</li>
                  <li>Marketing consent: Until you withdraw consent or become inactive for 3 years</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact & Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or wish to exercise your rights, please contact Elizabeth Carol:
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                  <p className="text-foreground font-medium">Elizabeth Carol - Clairvoyant & Psychic Medium</p>
                  <p className="text-muted-foreground">Telephone: <a href="tel:01865361786" className="text-primary hover:underline">01865 361 786</a></p>
                  <p className="text-muted-foreground">Location: Oxford, Oxfordshire</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy; 