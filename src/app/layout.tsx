import React from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import styles from "../styles/Layout.module.css";

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
      <body className={`${inter.className} ${styles.body}`}>
        <div className={styles.container}>
          <nav className={styles.nav}>
            <div className={styles.navItem}>
              <Link href="/" className={styles.navLink}>
                Mapa
              </Link>
            </div>
            <div className={styles.navItem}>
              <Link href="/table" className={styles.navLink}>
                Tabla
              </Link>
            </div>
          </nav>
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
