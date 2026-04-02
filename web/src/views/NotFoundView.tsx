import { Card } from "../components/Card";

export function NotFoundView() {
  return (
    <Card>
      <div className="flex flex-col gap-1 items-center">
        <h1 className="font-bold text-xl">404</h1>
        <p className="text-sm font-medium">This page does not exist...</p>
      </div>
    </Card>
  );
}
