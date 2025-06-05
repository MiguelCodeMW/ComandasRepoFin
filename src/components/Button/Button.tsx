import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ButtonProps } from "../../utils/types/ButtonTypes";

function Button({
  text,
  onClick,
  navigateTo,
  className,
  type = "button",
  disabled,
}: ButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      const result = onClick(e);
      if (result instanceof Promise) {
        result.catch((err) => console.error("Error en onClick:", err));
      }
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type={type}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default Button;
