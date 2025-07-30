export const categoryOptions = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion-apparel", label: "Fashion & Apparel" },
  { value: "home-kitchen", label: "Home & Kitchen" },
  { value: "health-beauty", label: "Health & Beauty" },
  { value: "sports-outdoors", label: "Sports & Outdoors" },
  { value: "baby-kids", label: "Baby & Kids" },
  { value: "automotive-tools", label: "Automotive & Tools" },
  { value: "books-music-media", label: "Books, Music & Media" },
  { value: "pet-supplies", label: "Pet Supplies" },
  {
    value: "office-supplies-stationery",
    label: "Office Supplies & Stationery",
  },
];

export function getCategoryLabel(value: string): string {
  return categoryOptions.find((opt) => opt.value === value)?.label || value;
}
