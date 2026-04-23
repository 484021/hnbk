import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  gridMesh?: boolean;
}

export default function SectionWrapper({
  children,
  className,
  id,
  gridMesh = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full overflow-x-hidden section-py",
        gridMesh && "grid-mesh",
        className,
      )}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
