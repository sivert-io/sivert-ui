import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Logo } from "../components/Logo";

export function FrontPageView() {
  return (
    <Card>
      <div className="flex flex-col gap-12 items-center">
        <div className="flex flex-col gap-2 items-center">
          <p>Find your</p>
          <Logo className="h-12 text-rose" />
        </div>
        <Button variant="solid">Enter queue</Button>
      </div>
    </Card>
  );
}
