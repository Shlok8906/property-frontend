import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Waves,
  Car,
  Shield,
  Trees,
  Wifi,
  Tv,
  Users,
  Zap,
  Droplets,
  Utensils,
  Leaf,
  Music,
  Lightbulb,
  Wind,
  X,
} from 'lucide-react';

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

const AMENITIES = [
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'swimming-pool', label: 'Swimming Pool', icon: Waves },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'security', label: '24/7 Security', icon: Shield },
  { id: 'garden', label: 'Garden', icon: Trees },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'tv', label: 'Cable TV', icon: Tv },
  { id: 'community-hall', label: 'Community Hall', icon: Users },
  { id: 'power-backup', label: 'Power Backup', icon: Zap },
  { id: 'water-purifier', label: 'Water Purifier', icon: Droplets },
  { id: 'kitchen', label: 'Modular Kitchen', icon: Utensils },
  { id: 'landscaping', label: 'Landscaping', icon: Leaf },
  { id: 'indoor-games', label: 'Indoor Games', icon: Music },
  { id: 'solar', label: 'Solar Power', icon: Lightbulb },
  { id: 'ac', label: 'Central AC', icon: Wind },
];

export function AmenitiesSelector({ selectedAmenities, onChange }: AmenitiesSelectorProps) {
  const toggleAmenity = (amenityId: string) => {
    const amenityLabel = AMENITIES.find(a => a.id === amenityId)?.label || amenityId;
    
    if (selectedAmenities.includes(amenityLabel)) {
      onChange(selectedAmenities.filter(a => a !== amenityLabel));
    } else {
      onChange([...selectedAmenities, amenityLabel]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenities.includes(amenity.label);
          
          return (
            <Button
              key={amenity.id}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleAmenity(amenity.id)}
              className={`flex flex-col items-center justify-center gap-1 h-auto py-3 transition-all ${
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'border-2 bg-transparent text-foreground hover:border-primary hover:bg-primary/10'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center leading-tight text-foreground">{amenity.label}</span>
            </Button>
          );
        })}
      </div>

      {selectedAmenities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAmenities.map((amenity, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => onChange(selectedAmenities.filter(a => a !== amenity))}
            >
              {amenity}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
