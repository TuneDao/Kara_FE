import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboards/devices");
  }, [router]);

  return null;
}
