import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  width: number;
  height: number;
};

export const placeholderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderImage(id: string): ImagePlaceholder | undefined {
  return placeholderImages.find((img) => img.id === id);
}

export function getPlaceholderImages(ids: string[]): ImagePlaceholder[] {
  return placeholderImages.filter((img) => ids.includes(img.id));
}
