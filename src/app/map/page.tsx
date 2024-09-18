"use client";

import React from "react";
import dynamic from "next/dynamic";
import styles from "../../styles/Map.module.css";

const MapWithNoSSR = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: () => <p>Cargando mapa...</p>,
});

export default function MapPage() {
  return (
    <div className={styles.mapPageContainer}>
      <MapWithNoSSR />
    </div>
  );
}
