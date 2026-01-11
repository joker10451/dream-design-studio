import { motion } from "framer-motion";
import { Share2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialShareData } from "@/data/content";
import { createSocialShareUrl } from "@/lib/contentUtils";

interface SocialShareButtonsProps {
  shareData: SocialShareData;
  onShare?: (platform: string) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function SocialShareButtons({ 
  shareData, 
  onShare, 
  size = 'default',
  variant = 'outline'
}: SocialShareButtonsProps) {
  const platforms = [
    {
      id: 'vk',
      name: 'VK',
      icon: Share2,
      color: '#4C75A3',
      url: createSocialShareUrl('vk', shareData)
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: '#0088CC',
      url: createSocialShareUrl('telegram', shareData)
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      url: createSocialShareUrl('whatsapp', shareData)
    }
  ];

  const handleShare = (platform: string, url: string) => {
    // Открываем окно для шаринга
    window.open(
      url,
      'share-window',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
    
    // Вызываем callback если есть
    onShare?.(platform);
  };

  return (
    <div className="flex items-center gap-2">
      {platforms.map((platform, index) => {
        const Icon = platform.icon;
        
        return (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Button
              variant={variant}
              size={size}
              onClick={() => handleShare(platform.id, platform.url)}
              className="group relative overflow-hidden"
              style={{
                '--platform-color': platform.color
              } as React.CSSProperties}
            >
              <Icon className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">{platform.name}</span>
              
              {/* Hover effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: platform.color }}
              />
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}