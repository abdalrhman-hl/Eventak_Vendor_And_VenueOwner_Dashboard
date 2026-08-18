import { useTheme } from "../lib/theme.jsx";
import logoTeal from "../assets/logo-teal.jpg";
import logoPurple from "../assets/logo-purple.jpg";

export default function Logo({ size = 96 }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? logoPurple : logoTeal;
  return (
    <img
      src={src}
      alt="Eventak"
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 16,
        boxShadow: "var(--shadow-luxury)",
        display: "block",
      }}
    />
  );
}
