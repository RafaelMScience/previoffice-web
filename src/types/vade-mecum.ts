/**
 * PreviOffice Vade Mécum Previdenciário Types
 * Maps to Brazilian Social Security & Legal statutes
 */

export type LawCategory =
  | 'BENEFICIOS'
  | 'CUSTEIO'
  | 'ASSISTENCIA'
  | 'REGULAMENTO'
  | 'CONSTITUICAO'
  | 'ADVOCACIA';

export interface LawReference {
  id: string;
  slug: string;
  title: string;
  officialNumber: string;
  publicationDate: string;
  category: LawCategory;
  categoryLabel: string;
  summary: string;
  urn: string;
  officialSourceUrl: string;
  compilationVersion: string; // e.g. "Texto compilado vigente (Planalto / LexML)"
}

export interface LawArticle {
  id: string;
  lawSlug: string;
  lawNumber: string;
  lawTitle: string;
  articleNumber: string; // e.g. "Art. 15"
  title: string;
  topicTag: string;
  content: string; // Markdown formatted article text with paragraphs and amendments
  officialSourceUrl: string;
}
