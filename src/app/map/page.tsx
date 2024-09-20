"use client";

import React from "react";
import dynamic from "next/dynamic";
import styles from "../../styles/Map.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";

const MapWithNoSSR = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function MapPage() {
  return (
    <div className={styles.mapPageContainer}>
      <MapWithNoSSR />
    </div>
  );
}
