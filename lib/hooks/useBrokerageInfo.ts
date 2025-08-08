import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BrokerageLink } from "@/lib/brokerage-links";

export function useBrokerageInfo() {
  const searchParams = useSearchParams();
  const [brokerageInfo, setBrokerageInfo] = useState<BrokerageLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrokerageInfo = async () => { // Made async
      setIsLoading(true);
      try {
        const { getBrokerageFromParams } = await import("@/lib/brokerage-links");
        const info = await getBrokerageFromParams(searchParams); // Await the call
        setBrokerageInfo(info);
      } catch (error) {
        console.error("Error fetching brokerage info:", error);
        setBrokerageInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrokerageInfo();
  }, [searchParams]);

  return { brokerageInfo, isLoading };
}
