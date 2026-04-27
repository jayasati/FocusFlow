"use client";

import { useEffect, useState } from "react";

function pickGreeting(h: number): string {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingSubtitle({ name }: { name: string }) {
  const [greeting, setGreeting] = useState<string>("Welcome back");
  useEffect(() => {
    setGreeting(pickGreeting(new Date().getHours()));
  }, []);
  return <>{`${greeting}, ${name}`}</>;
}
