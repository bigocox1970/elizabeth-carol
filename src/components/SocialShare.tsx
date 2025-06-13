import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Facebook, Twitter, Mail, Link2, MessageCircle, Copy, Check } from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  excerpt?: string;
  className?: string;
  showTitle?: boolean;
  shareTitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline';
}

const SocialShare = ({ 
  url, 
  title, 
  excerpt = "", 
  className = "", 
  showTitle = true,
  shareTitle = "Share This",
  size = 'md',
  variant = 'default'
}: SocialShareProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt);

  // Create a more personal email body
  const emailBody = encodeURIComponent(
    `Hi there!\n\nI thought you might be interested in this...\n\n${title}\n\n${excerpt}\n\nYou can read more here: ${url}\n\nHope you find it helpful!\n\nBest regards`
  );

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${emailBody}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'width=600,height=400');
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  const ShareButtons = () => (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('facebook')}
        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
      >
        <Facebook className={iconSize} />
        {size === 'lg' && <span className="ml-2 hidden lg:inline">Facebook</span>}
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('twitter')}
        className="text-sky-600 hover:bg-sky-50 hover:text-sky-700 border-sky-200"
      >
        <Twitter className={iconSize} />
        {size === 'lg' && <span className="ml-2 hidden lg:inline">Twitter</span>}
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('whatsapp')}
        className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
      >
        <MessageCircle className={iconSize} />
        {size === 'lg' && <span className="ml-2 hidden lg:inline">WhatsApp</span>}
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleShare('email')}
        className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 border-purple-200"
      >
        <Mail className={iconSize} />
        {size === 'lg' && <span className="ml-2 hidden lg:inline">Email</span>}
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleCopyLink}
        className="text-gray-600 hover:bg-gray-50 hover:text-gray-700 border-gray-200"
      >
        {copied ? (
          <Check className={`${iconSize} text-green-600`} />
        ) : (
          <Link2 className={iconSize} />
        )}
        {size === 'lg' && (
          <span className="ml-2 hidden lg:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
        )}
      </Button>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          {showTitle && (
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{shareTitle.toLowerCase()}</span>
            </div>
          )}
          <ShareButtons />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
        {showTitle && (
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Share:</span>
          </div>
        )}
        <ShareButtons />
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>{shareTitle}</span>
        </h3>
      )}
      <ShareButtons />
    </div>
  );
};

export default SocialShare; 