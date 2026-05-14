import { Card } from "../components/Card";
import { Accordion } from "../components/Accordion";

export function ShopView() {
  return (
    <Card>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Shop</h1>

          <div className="flex flex-col gap-1 text-sm">
            <h2 className="text-lg font-medium">FLOW Server Cosmetics</h2>

            <p className="text-foreground-muted">
              Spend credits earned by playing FLOW to unlock cosmetics for your
              server loadout.
            </p>

            <Accordion label="How does this work?">
              <div className="flex flex-col gap-4">
                <p>
                  Cosmetics unlocked here are applied by FLOW while you are
                  playing on FLOW servers.
                </p>

                <p>
                  They do not become part of your Steam inventory and cannot be
                  sold, traded, withdrawn, or used outside FLOW servers.
                </p>

                <p className="text-primary">
                  <strong>
                    In short: you are unlocking server-side cosmetics, not
                    buying CS2 items.
                  </strong>
                </p>
              </div>
            </Accordion>
          </div>
        </div>
      </div>
    </Card>
  );
}
