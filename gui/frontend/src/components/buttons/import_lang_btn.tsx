import { FileOpen } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { useCallback } from 'react';

import { importLang } from '@/backend_api';
import { notify } from '@/components/notifications';
import { useTranslation } from '@/hooks';

export const ImportLangButton = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(async () => {
    try {
      const contents = await importLang();
      if (contents) {
        JSON.parse(contents); // Parse test
        localStorage.setItem('custom-translation-dict', contents);
        localStorage.setItem('locale', 'custom');
        window.location.reload(); // To enable
      }
    } catch (e) {
      notify.error(`${e}`);
    }
  }, []);

  return (
    <Tooltip
      title={
        <>
          <p>{t('import-lang-tooltip')}</p>
          <p>{t('import-lang-tooltip2')}</p>
        </>
      }
    >
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
