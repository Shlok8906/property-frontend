import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { propertyAPI, Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type ChatStep = 'area' | 'type' | 'furnishing' | 'suitableFor' | 'budget' | 'possession' | 'done';

type ChatMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  kind?: 'text' | 'notice';
};

type ChatSelections = {
  area: string;
  propertyType: string;
  furnishing: string;
  suitableFor: string;
  budget: string;
  possession: string;
};

const propertyTypeOptions = ['Flat', 'Bungalow', 'PG'];
const furnishingOptions = ['Furnished', 'Unfurnished'];
const suitableForOptions = ['Family', 'Bachelor'];
const budgetOptions = ['15–20L', '20–25L', '25–30L', '30L+'];
const possessionOptions = ['Immediate', '1 Month', '2 Months'];

const budgetRangeMap: Record<string, { min: number; max: number }> = {
  '15–20L': { min: 1500000, max: 2000000 },
  '20–25L': { min: 2000000, max: 2500000 },
  '25–30L': { min: 2500000, max: 3000000 },
  '30L+': { min: 3000000, max: Number.MAX_SAFE_INTEGER },
};

const normalize = (value?: string) => (value || '').toLowerCase().trim();

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

const toSearchableText = (property: Property) =>
  [
    property.title,
    property.location,
    property.type,
    property.purpose,
    property.description,
    property.specification,
    Array.isArray(property.amenities) ? property.amenities.join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const getPropertyId = (property: Property) => property._id || property.id || '';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [step, setStep] = useState<ChatStep>('area');
  const [areaInput, setAreaInput] = useState('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selections, setSelections] = useState<ChatSelections>({
    area: '',
    propertyType: '',
    furnishing: '',
    suitableFor: '',
    budget: '',
    possession: '',
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const currentOptions = useMemo(() => {
    if (step === 'type') return propertyTypeOptions;
    if (step === 'furnishing') return furnishingOptions;
    if (step === 'suitableFor') return suitableForOptions;
    if (step === 'budget') return budgetOptions;
    if (step === 'possession') return possessionOptions;
    return [];
  }, [step]);

  const areaSuggestions = useMemo(() => {
    const query = normalize(areaInput);
    if (!query) return [];

    return availableAreas
      .filter((area) => normalize(area).startsWith(query))
      .slice(0, 8);
  }, [areaInput, availableAreas]);

  useEffect(() => {
    setHighlightedSuggestionIndex(areaSuggestions.length > 0 ? 0 : -1);
  }, [areaSuggestions]);

  useEffect(() => {
    if (isOpen && !initialized) {
      setInitialized(true);
      setMessages([
        {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: 'In which area are you interested to buy your house?',
        },
      ]);
    }
  }, [initialized, isOpen]);


  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, [messages, recommendations, loadingRecommendations]);

  useEffect(() => {
    if (!isOpen || step !== 'area' || availableAreas.length > 0) return;

    const loadAreas = async () => {
      try {
        const items = await propertyAPI.getAll();
        const uniqueAreas = Array.from(
          new Set(
            items
              .map((property) => property.location)
              .filter((location): location is string => Boolean(location && location.trim()))
              .map((location) => location.trim())
          )
        ).sort((a, b) => a.localeCompare(b));

        setAvailableAreas(uniqueAreas);
      } catch {
        setAvailableAreas([]);
      }
    };

    void loadAreas();
  }, [isOpen, step, availableAreas.length]);

  const addBotMessage = (text: string, kind: 'text' | 'notice' = 'text') => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'bot', text, kind }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'user', text }]);
  };

  const moveToNextStep = (selectedValue: string) => {
    if (step === 'type') {
      setSelections((prev) => ({ ...prev, propertyType: selectedValue }));
      addUserMessage(selectedValue);
      addBotMessage('Furnishing preference?');
      setStep('furnishing');
      return;
    }

    if (step === 'furnishing') {
      setSelections((prev) => ({ ...prev, furnishing: selectedValue }));
      addUserMessage(selectedValue);
      addBotMessage('Who is this property for?');
      setStep('suitableFor');
      return;
    }

    if (step === 'suitableFor') {
      setSelections((prev) => ({ ...prev, suitableFor: selectedValue }));
      addUserMessage(selectedValue);
      addBotMessage('Select your budget range');
      setStep('budget');
      return;
    }

    if (step === 'budget') {
      setSelections((prev) => ({ ...prev, budget: selectedValue }));
      addUserMessage(selectedValue);
      addBotMessage('When do you need possession?');
      setStep('possession');
      return;
    }

    if (step === 'possession') {
      const nextSelections = { ...selections, possession: selectedValue };
      setSelections(nextSelections);
      addUserMessage(selectedValue);
      setStep('done');
      void fetchRecommendations(nextSelections);
    }
  };

  const submitArea = (value?: string) => {
    const cleaned = (value ?? areaInput).trim();
    if (!cleaned) return;

    if (availableAreas.length > 0) {
      const normalized = normalize(cleaned);
      const matchedArea = availableAreas.find((area) => normalize(area) === normalized);

      if (!matchedArea) {
        addBotMessage('Please select a valid area from the suggestions.', 'notice');
        return;
      }

      setSelections((prev) => ({ ...prev, area: matchedArea }));
      addUserMessage(matchedArea);
      setAreaInput('');
      addBotMessage('What are you looking for?');
      setStep('type');
      return;
    }

    setSelections((prev) => ({ ...prev, area: cleaned }));
    addUserMessage(cleaned);
    setAreaInput('');
    addBotMessage('What are you looking for?');
    setStep('type');
  };

  const handleAreaInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (areaSuggestions.length === 0) return;
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => {
        if (prev < 0) return 0;
        return (prev + 1) % areaSuggestions.length;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      if (areaSuggestions.length === 0) return;
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => {
        if (prev < 0) return areaSuggestions.length - 1;
        return (prev - 1 + areaSuggestions.length) % areaSuggestions.length;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedSuggestionIndex >= 0 && highlightedSuggestionIndex < areaSuggestions.length) {
        submitArea(areaSuggestions[highlightedSuggestionIndex]);
      } else {
        submitArea();
      }
    }
  };

  const filterRecommendations = (items: Property[], currentSelections: ChatSelections) => {
    const budgetRange = budgetRangeMap[currentSelections.budget];
    const area = normalize(currentSelections.area);
    const selectedType = normalize(currentSelections.propertyType);
    const selectedFurnishing = normalize(currentSelections.furnishing);
    const selectedSuitableFor = normalize(currentSelections.suitableFor);
    const selectedPossession = normalize(currentSelections.possession);

    const strict = items.filter((property) => {
      const text = toSearchableText(property);
      const areaMatch = !area || normalize(property.location).includes(area) || normalize(property.title).includes(area);
      if (!areaMatch) return false;

      const price = Number(property.price || 0);
      if (!budgetRange || price < budgetRange.min || price > budgetRange.max) return false;

      if (selectedType === 'flat') {
        const typeMatch = includesAny(text, ['flat', 'apartment']);
        if (!typeMatch) return false;
      }

      if (selectedType === 'bungalow') {
        const typeMatch = includesAny(text, ['bungalow', 'villa', 'independent', 'house']);
        if (!typeMatch) return false;
      }

      if (selectedType === 'pg') {
        const typeMatch = includesAny(text, ['pg', 'paying guest', 'hostel', 'coliving']);
        if (!typeMatch) return false;
      }

      if (selectedFurnishing === 'furnished') {
        const furnishingMatch = includesAny(text, ['furnished', 'fully furnished', 'semi furnished', 'modular kitchen']);
        if (!furnishingMatch) return false;
      }

      if (selectedFurnishing === 'unfurnished') {
        const furnishingMatch = includesAny(text, ['unfurnished']);
        if (!furnishingMatch) return false;
      }

      if (selectedSuitableFor === 'family') {
        const suitableForMatch = includesAny(text, ['family']);
        if (!suitableForMatch) return false;
      }

      if (selectedSuitableFor === 'bachelor') {
        const suitableForMatch = includesAny(text, ['bachelor', 'bachelors']);
        if (!suitableForMatch) return false;
      }

      if (selectedPossession === 'immediate') {
        const possessionMatch = includesAny(text, ['immediate', 'ready to move', 'ready']);
        if (!possessionMatch) return false;
      }

      if (selectedPossession === '1 month') {
        const possessionMatch = includesAny(text, ['1 month', 'within 1 month']);
        if (!possessionMatch) return false;
      }

      if (selectedPossession === '2 months') {
        const possessionMatch = includesAny(text, ['2 month', '2 months', 'within 2 months']);
        if (!possessionMatch) return false;
      }

      return true;
    });

    if (strict.length > 0) {
      return { items: strict.slice(0, 6), isRelaxed: false };
    }

    const relaxed = items.filter((property) => {
      const text = toSearchableText(property);
      const areaMatch = !area || normalize(property.location).includes(area) || normalize(property.title).includes(area);
      if (!areaMatch) return false;

      const price = Number(property.price || 0);
      if (!budgetRange || price < budgetRange.min || price > budgetRange.max) return false;

      if (selectedType === 'flat') return includesAny(text, ['flat', 'apartment']);
      if (selectedType === 'bungalow') return includesAny(text, ['bungalow', 'villa', 'independent', 'house']);
      if (selectedType === 'pg') return includesAny(text, ['pg', 'paying guest', 'hostel', 'coliving']);
      return true;
    });

    return { items: relaxed.slice(0, 6), isRelaxed: true };
  };

  const fetchRecommendations = async (currentSelections: ChatSelections) => {
    try {
      setLoadingRecommendations(true);
      addBotMessage('Finding suitable properties for you...');

      const items = await propertyAPI.getAll();
      const { items: filtered } = filterRecommendations(items, currentSelections);
      setRecommendations(filtered);

      if (filtered.length === 0) {
        addBotMessage('No properties matched your preferences yet. Please try another area or budget.', 'notice');
      } else {
        addBotMessage('Here are your recommended properties:');
      }
    } catch {
      addBotMessage('Unable to fetch recommendations right now. Please try again in a moment.', 'notice');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const resetChat = () => {
    setStep('area');
    setAreaInput('');
    setRecommendations([]);
    setSelections({
      area: '',
      propertyType: '',
      furnishing: '',
      suitableFor: '',
      budget: '',
      possession: '',
    });
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: 'In which area are you interested to buy your house?',
      },
    ]);
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full shadow-xl sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle property chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 left-4 z-50 w-auto sm:bottom-24 sm:right-6 sm:left-auto sm:w-[420px] sm:max-w-[calc(100vw-2rem)]">
          <Card className="overflow-hidden border-border/80 shadow-2xl">
            <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
              <div>
                <p className="text-sm font-semibold">Property Assistant</p>
                <p className="text-xs opacity-90">Guided recommendations</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={resetChat}>
                Start Over
              </Button>
            </div>

            <div
              ref={scrollContainerRef}
              className="h-[360px] overflow-y-auto overscroll-contain bg-muted/20 p-4 sm:h-[480px]"
              onWheelCapture={(event) => {
                event.stopPropagation();
              }}
              onTouchMove={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : message.kind === 'notice'
                          ? 'bg-secondary/80 text-secondary-foreground rounded-bl-sm'
                          : 'bg-background border border-border rounded-bl-sm'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {loadingRecommendations && (
                  <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                    Loading recommendations...
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="space-y-2">
                    {recommendations.map((property) => {
                      const propertyId = getPropertyId(property);
                      if (!propertyId) return null;

                      const imageUrl =
                        Array.isArray(property.images) && property.images.length > 0
                          ? property.images[0]
                          : property.image_url || '';

                      return (
                        <Card
                          key={propertyId}
                          className="cursor-pointer border-border/70 transition-colors hover:border-primary/50"
                          onClick={() => window.open(`/properties/${propertyId}`, '_blank', 'noopener,noreferrer')}
                        >
                          <CardContent className="flex gap-3 p-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {imageUrl ? (
                                <img src={imageUrl} alt={property.title} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{property.title}</p>
                              <p className="text-xs text-muted-foreground">{property.location}</p>
                              <p className="mt-1 text-sm font-bold text-primary">{formatPrice(property.price)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {step === 'area' ? (
              <div className="border-t bg-background p-3">
                <div className="flex gap-2">
                  <Input
                    value={areaInput}
                    onChange={(event) => {
                      setAreaInput(event.target.value);
                      setHighlightedSuggestionIndex(-1);
                    }}
                    placeholder="Type area (e.g., Sus)"
                    onKeyDown={handleAreaInputKeyDown}
                  />
                  <Button size="icon" onClick={() => submitArea()} aria-label="Send area">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {areaSuggestions.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border bg-background p-1">
                    {areaSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted ${
                          areaSuggestions[highlightedSuggestionIndex] === suggestion ? 'bg-muted' : ''
                        }`}
                        onClick={() => submitArea(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : step !== 'done' ? (
              <div className="border-t bg-background p-3">
                <div className="flex flex-wrap gap-2">
                  {currentOptions.map((option) => (
                    <Button key={option} type="button" variant="outline" size="sm" onClick={() => moveToNextStep(option)}>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </>
  );
}
