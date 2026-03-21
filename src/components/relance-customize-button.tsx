"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { RelanceEmailEditor } from "@/components/relance-email-editor";

export function RelanceCustomizeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Mail className="mr-2 h-4 w-4 text-violet-500" />
        Personnaliser mes emails de relance
      </Button>
      <RelanceEmailEditor open={open} onOpenChange={setOpen} />
    </>
  );
}
