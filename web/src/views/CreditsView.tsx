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

        <p>
          Sound Effect by{" "}
          <Link to="https://pixabay.com/users/lordsonny-38439655/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=171285">
            LordSonny
          </Link>{" "}
          from{" "}
          <Link to="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=171285">
            Pixabay
          </Link>
        </p>
        <p>
          Sound Effect by{" "}
          <Link to="https://pixabay.com/users/kalsstockmedia-13377274/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=324301">
            Kalpesh Ajugia
          </Link>{" "}
          from{" "}
          <Link to="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=324301">
            Pixabay
          </Link>
        </p>
        <p>
          Sound Effect by{" "}
          <Link to="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=103824">
            freesound_community
          </Link>{" "}
          from{" "}
          <Link to="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=103824">
            Pixabay
          </Link>
        </p>
      </div>
    </Card>
  );
}
