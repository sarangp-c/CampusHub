export const sampleEquipmentPhotos: Record<string, string> = {
  Electronics: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80",
  Calculators: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
  "Lab Gear": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
  Sports: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=600&auto=format&fit=crop&q=80",
  "Media & AV": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  Default: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80",
};

export function getSamplePhotoForCategory(category: string): string {
  return sampleEquipmentPhotos[category] || sampleEquipmentPhotos.Default;
}
