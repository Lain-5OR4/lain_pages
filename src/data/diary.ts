export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  photos: { src: string; alt: string; stamp?: string }[];
}
