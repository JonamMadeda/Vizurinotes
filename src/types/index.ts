export interface Page {
  id: string;
  title: string;
  content: string;
  date: number;
}

export interface Note {
  id: string;
  title: string;
  pages: Page[];
  lastModified: number;
}
