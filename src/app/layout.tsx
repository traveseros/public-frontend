import React from "react";
import { Inter } from "next/font/google";
import ReactQueryProvider from "../components/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Traveseros</title>
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
