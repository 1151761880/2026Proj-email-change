import { ArrowRightIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function ContinueButton(props: ButtonProps) {
  return (
    <Button size="sm" {...props}>
      继续 <ArrowRightIcon className="size-4 ml-2" />
    </Button>
  );
}
