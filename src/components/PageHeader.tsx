import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export const PageHeader = ({ title, description, icon }: PageHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-6 mb-6 md:mb-8">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="hidden sm:flex items-center justify-center rounded-lg bg-primary/10 p-3 mt-1">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
