// Copyright (c) 2023 Luma <lumakernel@gmail.com>
// SPDX-License-Identifier: MIT or Apache-2.0
import { PageNavigation } from '@/components/organisms/PageNavigation';
import { GlobalProvider } from '@/components/providers';
import { LANG } from '@/lib/i18n';
import { LOG } from '@/services/api/log';

import type { ReactNode } from 'react';

LANG.init();
LOG.changeLevel(LOG.get());

type Props = Readonly<{
  children: ReactNode;
}>;

const ClientLayout = ({ children }: Props) => {
  return (
    <GlobalProvider>
      {children}
      <PageNavigation />
    </GlobalProvider>
  );
};

export default ClientLayout;
