import React, { useMemo } from "react";
import { Polyline } from "react-leaflet";
import { RouteData } from "@/types/global";
import { getRouteColor } from "../app/lib/teams/utils";

interface RouteMapElementsProps {
  routes: RouteData[];
}

const RouteMapElements: React.FC<RouteMapElementsProps> = ({ routes }) => {
  const memoizedRoutes = useMemo(() => {
    return routes.map((route) => ({
      ...route,
      color: getRouteColor(route.type),
    }));
  }, [routes]);

  return (
    <>
      {memoizedRoutes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.coordinates.map((coord) => [coord.lat, coord.lng])}
          pathOptions={{
            color: route.color,
            weight: 5,
            opacity: 1,
            dashArray: "10, 10",
            interactive: false,
            bubblingMouseEvents: false,
          }}
        />
      ))}
    </>
  );
};

export default React.memo(RouteMapElements);
