import { Card } from "../components/Card";
import { Link } from "../components/Link";
import type React from "react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex flex-col gap-3 text-sm text-foreground-muted">
        {children}
      </div>
    </section>
  );
}

export function PrivacyPolicyView() {
  return (
    <Card>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-foreground-muted">
            Last updated: April 11, 2026
          </p>
          <p className="text-sm text-foreground-muted">
            This Privacy Policy explains how FLOW collects, uses, stores, and
            protects personal data when you use the platform.
          </p>
        </div>

        <Section title="1. Who we are">
          <p>
            FLOW is a community-driven Counter-Strike 2 matchmaking platform. In
            this policy, “FLOW”, “we”, “us”, and “our” refer to the operator of
            the platform.
          </p>
          <p>
            For privacy questions or requests, contact us at{" "}
            <a
              className="text-primary underline underline-offset-4"
              href="mailto:privacy@flow.example"
            >
              privacy@flow.example
            </a>
            .
          </p>
        </Section>

        <Section title="2. What data we collect">
          <p>We may collect and store the following categories of data:</p>
          <ul className="list-disc pl-5">
            <li>
              Steam account information such as your Steam ID, display name,
              profile URL, and avatar.
            </li>
            <li>
              Account and profile information made available through Steam
              sign-in.
            </li>
            <li>
              Session and security data such as session identifiers, expiry
              times, revoked-session data, hashed IP signals, and hashed
              user-agent signals.
            </li>
            <li>
              Social and activity data such as friendships, friend requests,
              lobbies, invites, queue participation, match participation, and
              notifications.
            </li>
            <li>
              Optional game-related information you submit, including CS2 share
              keys or authentication codes, where applicable.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <ul className="list-disc pl-5">
            <li>To authenticate your account through Steam.</li>
            <li>To provide lobby, queue, invite, and matchmaking features.</li>
            <li>To display your identity and community status inside FLOW.</li>
            <li>To deliver notifications and support social features.</li>
            <li>To maintain platform security and reduce abuse or misuse.</li>
            <li>To debug, improve, and operate the platform.</li>
          </ul>
        </Section>

        <Section title="4. Legal basis">
          <p>
            Where applicable under GDPR and related laws, we process personal
            data because it is necessary to provide the service you request, to
            pursue legitimate interests such as security and platform integrity,
            or because you have given consent where consent is required.
          </p>
        </Section>

        <Section title="5. Sharing">
          <p>We do not sell your personal data.</p>
          <p>We may share data only when reasonably necessary, including:</p>
          <ul className="list-disc pl-5">
            <li>with service providers that help us operate the platform;</li>
            <li>with infrastructure or hosting providers;</li>
            <li>
              when required by law or to protect safety, rights, or security;
            </li>
            <li>
              with other users as part of normal platform functionality, such as
              showing profiles, lobby membership, or host badges.
            </li>
          </ul>
        </Section>

        <Section title="6. Retention">
          <p>
            We keep personal data only for as long as reasonably necessary for
            the purposes described in this policy, including to operate the
            platform, maintain security, resolve disputes, and comply with legal
            obligations.
          </p>
          <p>
            Retention periods may differ by data type. For example, active
            account data may be retained while your account is in use, while
            expired or revoked session records may be removed or anonymized
            later.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use reasonable technical and organizational measures to protect
            personal data. However, no system can be completely secure.
          </p>
        </Section>

        <Section title="8. Your rights">
          <p>
            Depending on your location and applicable law, you may have the
            right to request access, correction, deletion, restriction, or
            portability of your personal data, and in some cases to object to
            processing.
          </p>
          <p>
            You may also have the right to lodge a complaint with your local
            data protection authority.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            FLOW is not intended for use where prohibited by applicable law for
            children. If you believe personal data has been provided unlawfully,
            contact us.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will update the “Last updated” date on this page.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For more information about the project, visit our{" "}
            <Link to="/about">About page</Link>.
          </p>
        </Section>
      </div>
    </Card>
  );
}
