"use client";
import { AppLayout } from "../components/AppLayout";
import { ThemeProvider } from "../../components/theme-provider";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme="dark"
    >
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </ThemeProvider>
  );
}