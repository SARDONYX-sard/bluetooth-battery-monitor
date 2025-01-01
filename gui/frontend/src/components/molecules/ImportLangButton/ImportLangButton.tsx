import { FileOpen } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { useCallback } from 'react';

import { useTranslation } from '@/components/hooks/useTranslation';
import { NOTIFY } from '@/lib/notify';
import { STORAGE } from '@/lib/storage';
import { importLang } from '@/services/api/lang';

export const ImportLangButton = () => {
  const { t } = useTranslation();

  const title = (
    <>
      <p>{t('import-lang-tooltip')}</p>
      <p>{t('import-lang-tooltip2')}</p>
    </>
  );

  const handleClick = useCallback(() => {
    NOTIFY.asyncTry(async () => {
      const contents = await importLang();
      if (contents) {
        JSON.parse(contents); // Parse test
        STORAGE.set('custom-translation-dict', contents);
        STORAGE.set('locale', 'custom');
        window.location.reload(); // To enable
      }
    });
  }, []);

  return (
    <Tooltip title={title}>
      <Button
        onClick={handleClick}
        startIcon={<FileOpen />}
        sx={{
          height: '4em',
          marginTop: '8px',
          minWidth: '120px',
          width: '120px',
        }}
        type='button'
        variant='outlined'
      >
        {t('import-lang-btn')}
      </Button>
    </Tooltip>
  );
};
