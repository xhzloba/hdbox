import * as React from "react";
import { cn } from "../../lib/utils";

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "text-foreground underline-offset-4 hover:underline cursor-pointer transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
Link.displayName = "Link";

export { Link };
