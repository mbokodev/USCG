"use client";

import { useParams } from "next/navigation";
import { SellerRequestDetail } from "@/features/seller-requests";
import { ROUTES } from "@/config/routes";

export default function SellerRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  return (
    <SellerRequestDetail
      requestId={requestId}
      backPath={ROUTES.SELLER_REQUESTS.LIST}
    />
  );
}
