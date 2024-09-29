"use client";

import React from "react";
import dynamic from "next/dynamic";

const SharedDataContainerWithNoSSR = dynamic(
  () => import("../../components/SharedDataContainer"),
  {
    ssr: false,
  }
);

const MapPage: React.FC = React.memo(() => {
  return <SharedDataContainerWithNoSSR showMap={true} />;
});

MapPage.displayName = "MapPage";

export default MapPage;
