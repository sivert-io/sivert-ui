import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Logo } from "../components/Logo";
import { Spinner } from "../components/Spinner";

export function FrontPageView() {
  const [isInQueue, setIsInQueue] = useState(false);

  return (
    <Card>
      <div className="flex flex-col gap-12 items-center">
        <div className="flex flex-col gap-2 items-center">
          <p>Find your</p>
          <Logo className="h-12 text-primary" />
        </div>

        <div className="flex flex-col gap-6 items-center">
          {isInQueue && <Spinner size={64} easing="snappy" duration={1} />}
          <Button
            onClick={() => setIsInQueue((prev) => !prev)}
            variant={isInQueue ? "outline" : "solid"}
          >
            {isInQueue ? "Stop searching" : "Enter queue"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
