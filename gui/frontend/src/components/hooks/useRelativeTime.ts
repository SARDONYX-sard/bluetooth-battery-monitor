import { useTranslation } from '@/components/hooks/useTranslation';

export const useRelativeTime = (date: string) => {
  const { t } = useTranslation();

  const relativeTime = () => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime(); // milliseconds diff
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}${t('relativeTime.days')}`;
    }
    if (hours > 0) {
      return `${hours}${t('relativeTime.hours')}`;
    }
    if (minutes > 0) {
      return `${minutes}${t('relativeTime.minutes')}`;
    }
    return `${seconds}${t('relativeTime.seconds')}`;
  };

  return relativeTime();
};
