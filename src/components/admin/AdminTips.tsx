import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminTips = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tips for Elizabeth</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>• <strong>Contact Form:</strong> Anyone who fills out the contact form is automatically added to your mailing list</p>
        <p>• <strong>Newsletter Signup:</strong> Visitors can also subscribe directly using the newsletter form</p>
        <p>• <strong>Email Ideas:</strong> Upcoming workshops, meditation sessions, spiritual insights, testimonials, or special offers</p>
        <p>• <strong>Frequency:</strong> Monthly newsletters work well - not too often, but keeps you connected</p>
        <p>• <strong>Personal Touch:</strong> Share your spiritual insights and connect personally with your clients</p>
        <p>• <strong>Blog Posts:</strong> Regular blog posts help with SEO and keep your website fresh</p>
        <p>• <strong>Reviews:</strong> Encourage clients to leave reviews to build trust with new visitors</p>
      </CardContent>
    </Card>
  );
};

export default AdminTips;
