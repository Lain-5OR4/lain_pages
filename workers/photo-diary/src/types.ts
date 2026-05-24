export type DiaryEntry = {
	id: string;
	date: string;
	title: string;
	description: string;
	photos: Array<{ src: string; alt: string; stamp?: string }>;
};
