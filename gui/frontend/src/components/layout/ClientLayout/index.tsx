'use client'; // If this directive is not present on each page, a build error will occur.

// NOTE: From next15, { ssr: false } can only be called by the Client component.
import dynamic from 'next/dynamic';

import Loading from '@/components/templates/Loading';

import type { ReactNode } from 'react';

const DynClientLayout = dynamic(() => import('@/components/layout/ClientLayout/ClientLayout'), {
  loading: () => <Loading />,
  ssr: false,
});

type Props = Readonly<{
  children: ReactNode;
}>;

const ClientLayout = ({ children }: Props) => {
  return <DynClientLayout>{children}</DynClientLayout>;
};

export default ClientLayout;
