import { Card } from "../components/Card";
import { Link } from "../components/Link";

export function CreditsView() {
  return (
    <Card>
      <div className="flex flex-col gap-8">
        <h1 className="font-bold text-2xl">Credits</h1>

        <p>
          Sound Effect by{" "}
          <Link to="https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=350210">
            Universfield
          </Link>{" "}
          from{" "}
          <Link to="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=350210">
            Pixabay
          </Link>
        </p>
      </div>
    </Card>
  );
}
