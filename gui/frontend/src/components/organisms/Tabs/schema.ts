import { z } from 'zod';

const tabList = ['editor', 'notice', 'lang', 'tab', 'backup'] as const;
export const TabSchema = z.enum(tabList).catch('editor');
