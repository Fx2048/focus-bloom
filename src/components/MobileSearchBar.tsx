import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function MobileSearchBar({ value, onChange }: MobileSearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border p-3 sm:hidden">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('search.placeholder')}
          className="pl-9 h-10 bg-muted border-0 rounded-xl"
        />
      </div>
    </div>
  );
}
