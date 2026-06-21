import type { ReactNode, CSSProperties } from "react";
import type { MotionProps } from "framer-motion";

export interface BaseProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type MotionBaseProps = BaseProps & Omit<Partial<MotionProps>, "children" | "style" | "ref" | "key">;

export interface LayoutProps extends BaseProps {
  transparent?: boolean;
}

export interface SectionProps extends BaseProps {
  id?: string;
  fullWidth?: boolean;
  containerClass?: string;
}

export interface DataProps<T> {
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}
