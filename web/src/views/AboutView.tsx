import { Link } from "../components/Link";
import { Card } from "../components/Card";
import type React from "react";
import { HostBadge } from "../components/HostBadge";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="text-sm text-foreground-muted">{children}</div>
    </div>
  );
};

export function AboutView() {
  return (
    <Card>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <Section title="What is FLOW?">
          <p>
            FLOW is a community-driven match-making platform built for
            Counter-Strike 2. It combines player queues, self-hosted community
            servers, social features, and a lightweight trust system.
          </p>
        </Section>

        <Section title="What makes FLOW different?">
          <p>
            FLOW is built around community participation. Players can host
            verified servers, contribute to a healthier queue ecosystem, and
            earn community recognition through roles like <HostBadge />.
          </p>
        </Section>

        <Section title="Who runs FLOW?">
          <p>
            FLOW is developed, maintained, and operated by Norwegian designer
            and developer{" "}
            <Link target="_blank" to="https://sivert.io">
              Sivert Gullberg Hansen
            </Link>
            . It is a passion project built from the ground up with modern web
            technologies.
          </p>
        </Section>

        <Section title='Why "FLOW"?'>
          <p>
            The name comes from the platform slogan: <i>"Find your flow"</i>.
          </p>
        </Section>

        <Section title="Can I host a server?">
          <p>
            Yes. FLOW supports community-hosted servers through a verification
            process and a dedicated host dashboard. Visit{" "}
            <Link to="/host">Host a server</Link> to learn more.
          </p>
        </Section>

        <Section title="Can I contribute to FLOW?">
          <p>
            Yes. The project is open source and community-driven. You can
            contribute through code, testing, feedback, and hosting.
          </p>
          <p>
            Visit the project on{" "}
            <Link target="_blank" to="https://github.com/flow">
              GitHub
            </Link>
            .
          </p>
        </Section>
      </div>
    </Card>
  );
}
