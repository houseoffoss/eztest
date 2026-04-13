"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/reusable-components/layout/Navbar";
import { Card, CardContent } from "@/frontend/reusable-elements/cards/Card";
import { ButtonPrimary } from "@/frontend/reusable-elements/buttons/ButtonPrimary";
import { ChevronRight, BarChart2, Play, FlaskConical } from "lucide-react";

interface Props {
  configId: string;
}

export default function AgentTestNoResults({ configId }: Props) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  return (
    <div className="flex-1">
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <span className="flex items-center gap-1 text-sm text-white/50">
            <button
              onClick={() => router.push("/agent-testing/setup")}
              className="cursor-pointer hover:text-white/80 transition-colors"
            >
              Agent Testing
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">Results</span>
          </span>
        }
        actions={[{ type: "signout" as const, showConfirmation: true }]}
      />

      <div className="px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <Card
            variant="glass"
            className="hover:shadow-xl hover:shadow-primary/10 transition-all"
          >
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart2 className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                No results yet
              </h3>
              <p className="text-white/50 mb-8 text-center max-w-sm">
                This configuration has not been tested yet. Generate test cases
                and run them to see results here.
              </p>
              <div className="flex items-center gap-3">
                <ButtonPrimary
                  variant="ghost"
                  onClick={() =>
                    router.push(`/agent-testing/configs/${configId}/test-cases`)
                  }
                  buttonName="Agent Test No Results - View Test Cases"
                  className="gap-2"
                >
                  <FlaskConical className="w-4 h-4" />
                  View Test Cases
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={() => router.push("/agent-testing/setup")}
                  buttonName="Agent Test No Results - Go to Setup"
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run Tests
                </ButtonPrimary>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
