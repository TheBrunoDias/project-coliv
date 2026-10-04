import type { Locale } from '../config';
import { en } from './en';
import { ptBR, type Messages } from './pt-BR';

export type { Messages };

export const messages: Record<Locale, Messages> = {
  'pt-BR': ptBR,
  en,
};
