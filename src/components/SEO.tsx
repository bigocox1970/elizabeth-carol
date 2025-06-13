import { Helmet } from 'react-helmet-async';
import { SEOConfig } from '@/utils/seo';

interface SEOProps extends SEOConfig {
  children?: React.ReactNode;
}

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage = "/images/elizabeth-carol-logo-full-dark.png",
  canonicalUrl,
  children 
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional meta tags */}
      <meta name="author" content="Elizabeth Carol" />
      <meta name="geo.region" content="GB-OXF" />
      <meta name="geo.placename" content="Oxford, Oxfordshire" />
      
      {children}
    </Helmet>
  );
};

export default SEO; 