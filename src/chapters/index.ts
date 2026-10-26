import type { Chapter } from '../kit/chapter';
import { OUTLINE } from './outline';

/** All built chapters of the explainer, in telling order (the deck's order). */
export const CHAPTERS: Chapter[] = OUTLINE.flatMap((e) => (e.chapter ? [e.chapter] : []));
