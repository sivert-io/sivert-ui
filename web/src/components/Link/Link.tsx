import * as React from "react";
import { MdOpenInNew } from "react-icons/md";
import { Link, type LinkProps } from "react-router";

type Props = LinkProps & {
  underline?: boolean;
  showExternalIcon?: boolean;
};

function isExternalHref(to: LinkProps["to"]) {
  return typeof to === "string" && /^https?:\/\//.test(to);
}

export const LinkComponent = React.forwardRef<HTMLAnchorElement, Props>(
  function LinkComponent(
    {
      underline = true,
      showExternalIcon = true,
      className = "",
      to,
      children,
      ...props
    },
    ref,
  ) {
    const isExternal = isExternalHref(to);

    const classes = [
      "inline-flex items-center gap-1",
      underline ? "underline underline-offset-4" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (isExternal && typeof to === "string") {
      return (
        <a
          {...props}
          ref={ref}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
          {showExternalIcon ? <MdOpenInNew aria-hidden="true" /> : null}
        </a>
      );
    }

    return (
      <Link {...props} ref={ref} to={to} className={classes}>
        {children}
      </Link>
    );
  },
);
