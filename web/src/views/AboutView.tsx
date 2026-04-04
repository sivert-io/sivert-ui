import { Link } from "../components/Link";
import { Card } from "../components/Card";
import type React from "react";

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
      {children}
    </div>
  );
};

export function AboutView() {
  return (
    <Card>
      <div className="flex flex-col gap-12">
        <Section title="What is FLOW?">
          <p>
            Flow is a community-driven match-making platform built for
            Counter-Strike 2. It features self-hosted servers, an honor system
            and community awards.
          </p>
        </Section>

        <Section title="Who runs FLOW?">
          <p>
            Flow is developed, maintained, driven and upkept by Norwegian
            designer and developer{" "}
            <Link target="_blank" to="https://sivert.io">
              Sivert Gullberg Hansen
            </Link>
            . Built from the ground up with modern technologies, it's a passion
            project that's been in the making since April of 2026.
          </p>
        </Section>

        <Section title='Why "FLOW?"'>
          <p>
            The choice of name lies in the platform's slogan:{" "}
            <i className="text-nowrap">"Find your flow"</i>.
          </p>
        </Section>

        <Section title="Can I contribute to FLOW?">
          <p>
            Yes you can! The project is <strong>open source</strong> and the
            repository can be found over on our{" "}
            <Link target="_blank" to="https://github.com/flow">
              GitHub
            </Link>
            . Alternatively, you can{" "}
            <Link to="/feedback">provide feedback</Link> to help us improve.
          </p>
        </Section>
      </div>
    </Card>
  );
}
