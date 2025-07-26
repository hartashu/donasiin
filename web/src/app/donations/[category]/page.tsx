import DonationCards from "@/components/DonationCards";

export default async function CategoryDonationsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return <DonationCards category={(await params).category} />;
}
