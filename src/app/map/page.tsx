"use client";

import React from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "../../components/LoadingSpinner";

const MapWithNoSSR = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const MapPage: React.FC = React.memo(() => {
  return <MapWithNoSSR />;
});

MapPage.displayName = "MapPage";

export default MapPage;
