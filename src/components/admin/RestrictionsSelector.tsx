import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Cat,
  Dog,
  Utensils,
  Wine,
  Cigarette,
  Music,
  Users,
  Baby,
  X,
} from 'lucide-react';

interface RestrictionsSelectorProps {
  selectedRestrictions: string[];
  onChange: (restrictions: string[]) => void;
}

const RESTRICTIONS = [
  { id: 'no-pets', label: 'No Pets', icon: Cat },
  { id: 'no-dogs', label: 'No Dogs', icon: Dog },
  { id: 'no-cooking', label: 'No Non-Veg Cooking', icon: Utensils },
  { id: 'no-alcohol', label: 'No Alcohol', icon: Wine },
  { id: 'no-smoking', label: 'No Smoking', icon: Cigarette },
  { id: 'no-loud-music', label: 'No Loud Music', icon: Music },
  { id: 'no-guests', label: 'No Guests/Parties', icon: Users },
  { id: 'no-children', label: 'No Children', icon: Baby },
];

export function RestrictionsSelector({ selectedRestrictions, onChange }: RestrictionsSelectorProps) {
  const toggleRestriction = (restrictionId: string) => {
    const restrictionLabel = RESTRICTIONS.find(r => r.id === restrictionId)?.label || restrictionId;
    
    if (selectedRestrictions.includes(restrictionLabel)) {
      onChange(selectedRestrictions.filter(r => r !== restrictionLabel));
    } else {
      onChange([...selectedRestrictions, restrictionLabel]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {RESTRICTIONS.map((restriction) => {
          const Icon = restriction.icon;
          const isSelected = selectedRestrictions.includes(restriction.label);
          
          return (
            <Button
              key={restriction.id}
              type="button"
              variant={isSelected ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => toggleRestriction(restriction.id)}
              className={`flex flex-col items-center justify-center gap-1 h-auto py-3 transition-all ${
                isSelected
                  ? 'bg-destructive text-destructive-foreground border-destructive'
                  : 'border-2 text-foreground hover:border-destructive hover:bg-destructive/5'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center leading-tight text-foreground">{restriction.label}</span>
            </Button>
          );
        })}
      </div>

      {selectedRestrictions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRestrictions.map((restriction, index) => (
            <Badge
              key={index}
              variant="destructive"
              className="flex items-center gap-1 pr-2 cursor-pointer hover:bg-primary transition-colors"
              onClick={() => onChange(selectedRestrictions.filter(r => r !== restriction))}
            >
              {restriction}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
