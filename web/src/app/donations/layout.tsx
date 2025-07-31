import { Suspense } from "react";
import DonationsClientUI from "./DonationsClientUI";

function UILoading() {
  return <div className="p-6 text-center text-gray-500">Loading UI...</div>;
}

export default function DonationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<UILoading />}>
      <DonationsClientUI>
        {children}
      </DonationsClientUI>
    </Suspense>
  );
}
