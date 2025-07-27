import DonationCards from "@/components/donations/DonationCards";

export default async function CategoryDonationsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return <DonationCards category={(await params).category} />;
}
