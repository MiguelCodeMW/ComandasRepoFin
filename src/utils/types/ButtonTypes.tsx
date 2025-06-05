import { MouseEvent } from "react";

export type ButtonProps = {
  text: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  navigateTo?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};
