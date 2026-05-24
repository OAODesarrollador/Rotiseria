import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import CursorGlow from "@/components/ui/CursorGlow";

export const metadata = {
  title: "La Parrilla - Rotisería",
  description: "Las mejores carnes y comidas caseras.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <CursorGlow />
          <Header />
          <main>
            {children}
          </main>
          <div className="section-curve section-curve--footer" aria-hidden="true" />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
