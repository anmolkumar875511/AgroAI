import { useAuth } from '@/contexts/AuthContext';
import { getTranslation } from '@/i18n/translations';

export function useTranslation() {
  const { user } = useAuth();
  const language = user?.language;

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return { t, language };
}
