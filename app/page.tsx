import { Suspense } from "react";
import { TimerApp } from "@/components/TimerApp";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <TimerApp />
    </Suspense>
  );
}
