'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


export default function StudentDashboard() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="email" placeholder="Email" />
      <Button type="submit" variant="outline">
        Subscribe
      </Button>
    </div>
  );
}
