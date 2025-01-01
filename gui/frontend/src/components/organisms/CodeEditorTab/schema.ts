import { z } from 'zod';

export const schema = z.enum(['javascript', 'css']).catch('javascript');
