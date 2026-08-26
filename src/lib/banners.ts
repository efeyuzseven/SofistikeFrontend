export type HomeBanner = {
  id: string;
  imageUrl: string;
  altText: string;
  title: string | null;
  description: string | null;
  buttonText: string | null;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  updatedAtUtc: string;
};
