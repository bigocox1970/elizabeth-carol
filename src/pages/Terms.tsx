import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageSEO } from "@/utils/seo";

const Terms = () => {
  const seoData = getPageSEO('terms');

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoData} />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Professional standards and expectations for Elizabeth Carol's spiritual services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>Service Agreement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By booking a reading or service with Elizabeth Carol, you agree to the following terms and conditions. 
                  These terms ensure a respectful, professional, and beneficial experience for all parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nature of Spiritual Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Entertainment and Guidance:</strong> All readings and spiritual services are provided for entertainment, 
                  spiritual guidance, and personal insight purposes. While Elizabeth Carol operates with integrity and genuine intention:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Readings are not a substitute for professional medical, legal, or financial advice</li>
                  <li>Results cannot be guaranteed as spiritual communication varies</li>
                  <li>Each reading is unique and dependent on spiritual connection at the time</li>
                  <li>Elizabeth Carol will always work honestly and with your best interests at heart</li>
                  <li>You are encouraged to use your own judgment when making decisions based on guidance received</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking & Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Scheduling & Confirmation:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>All appointments must be booked in advance by telephone on 01865 361 786</li>
                  <li>Appointment times are confirmed once payment has been received</li>
                  <li>For telephone/video readings, you will be called at the scheduled time</li>
                  <li>Home visits require advance scheduling and may include travel charges</li>
                  <li>Please ensure you have a quiet, private space available for your reading</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Pricing & Payment:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>All prices are agreed upfront with no hidden fees</li>
                  <li>Payment is required in advance for telephone/video readings</li>
                  <li>In-person readings can be paid on the day by cash or bank transfer</li>
                  <li>Group events require a deposit to secure booking</li>
                  <li>Concessions may be available for those experiencing financial hardship - please discuss when booking</li>
                  <li>Prices may be reviewed annually but existing bookings honor agreed rates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Client Cancellations:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>24 hours notice required for all cancellations</li>
                  <li>Cancellations with 24+ hours notice: Full refund or rescheduling available</li>
                  <li>Cancellations with less than 24 hours notice: 50% charge applies</li>
                  <li>No-shows: Full payment required</li>
                  <li>Emergency situations will be considered on a case-by-case basis</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>Service Provider Cancellations:</strong> In the rare event Elizabeth Carol needs to cancel, 
                  you will receive full refund or priority rescheduling, plus compensation for any inconvenience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To ensure the best possible reading experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Arrive on time and prepared for your reading</li>
                  <li>Come with an open mind and heart</li>
                  <li>Respect the spiritual nature of the service</li>
                  <li>Ask questions if you need clarification</li>
                  <li>Maintain confidentiality regarding other participants in group readings</li>
                  <li>Understand that not all questions may receive answers during the session</li>
                  <li>Take responsibility for decisions made based on guidance received</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ethical Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Elizabeth Carol operates under strict ethical guidelines:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Honesty:</strong> All communications from spirit will be relayed truthfully</li>
                  <li><strong>Respect:</strong> All clients are treated with dignity regardless of background or beliefs</li>
                  <li><strong>Boundaries:</strong> Professional boundaries are maintained at all times</li>
                  <li><strong>Confidentiality:</strong> Complete privacy regarding all reading content</li>
                  <li><strong>Non-judgment:</strong> A safe, accepting space for all spiritual experiences</li>
                  <li><strong>Empowerment:</strong> Guidance aims to empower you to make your own decisions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Age Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Minimum Age Policy:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Clients must be 18 years or older for individual readings</li>
                  <li>16-17 year olds may receive readings with written parental consent and parent present</li>
                  <li>Group events may include younger participants at the discretion of the event organizer and with parental consent</li>
                  <li>Special consideration is given to readings involving bereavement for younger clients</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Important Notice:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Spiritual readings are for guidance and entertainment purposes</li>
                  <li>Please consult qualified professionals for medical, legal, or financial advice</li>
                  <li>Elizabeth Carol accepts no responsibility for decisions made based solely on reading guidance</li>
                  <li>Results may vary and spiritual connection cannot be guaranteed</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>Free will allows you to change any predicted outcomes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Complaints & Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any concerns about your reading or service:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Please speak directly with Elizabeth Carol first to resolve any issues</li>
                  <li>All complaints will be treated seriously and addressed promptly</li>
                  <li>A fair resolution will be sought in all cases</li>
                  <li>Refunds may be offered where appropriate</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  These terms may be updated occasionally to reflect changes in service offerings or legal requirements. 
                  Updated terms will be posted on this website with the revision date clearly marked. 
                  Continued use of services constitutes acceptance of any updated terms.
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg space-y-2 mt-6">
                  <p className="text-foreground font-medium">Contact Elizabeth Carol</p>
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

export default Terms; 