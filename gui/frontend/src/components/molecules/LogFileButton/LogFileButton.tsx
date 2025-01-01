import FileOpen from '@mui/icons-material/FileOpen';

import { useTranslation } from '@/components/hooks/useTranslation';
import { ButtonWithToolTip } from '@/components/molecules/ButtonWithToolTip';
import { NOTIFY } from '@/lib/notify';
import { LOG } from '@/services/api/log';

export const LogFileButton = () => {
  const { t } = useTranslation();
  const handleClick = () => NOTIFY.asyncTry(async () => await LOG.openFile());

  return (
    <ButtonWithToolTip
      buttonName={t('open-log-btn')}
      icon={<FileOpen />}
      onClick={handleClick}
      tooltipTitle={t('open-log-tooltip')}
    />
  );
};
