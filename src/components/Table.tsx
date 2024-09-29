import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  TeamData,
  ROUTE_TYPES,
  TEAM_STATUSES,
  RouteType,
  TeamStatus,
} from "@/types/global";
import styles from "../styles/Table.module.css";
import { useTeamData } from "../hooks/useTeamData";
import LoadingSpinner from "./LoadingSpinner";
import VisualError from "./VisualError";

const Table: React.FC = () => {
  const { teams, loading, error, refetch } = useTeamData();
  const [globalFilter, setGlobalFilter] = useState("");
  const columnHelper = createColumnHelper<TeamData>();

  const routeTypeLabels: Record<RouteType, string> = {
    [ROUTE_TYPES.FAMILY]: "Familiar",
    [ROUTE_TYPES.SHORT]: "Corta",
    [ROUTE_TYPES.LONG]: "Larga",
  };

  const teamStatusLabels: Record<TeamStatus, string> = {
    [TEAM_STATUSES.NOT_STARTED]: "No iniciado",
    [TEAM_STATUSES.IN_PROGRESS]: "En progreso",
    [TEAM_STATUSES.WARNING]: "Advertencia",
    [TEAM_STATUSES.DANGEROUS]: "Peligro",
    [TEAM_STATUSES.FINISHED]: "Finalizado",
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("dorsal", {
        header: "Dorsal",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name", {
        header: "Nombre",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("route", {
        header: "Ruta",
        cell: (info) => routeTypeLabels[info.getValue()],
      }),
      columnHelper.accessor("status", {
        header: "Estado",
        cell: (info) => teamStatusLabels[info.getValue()],
      }),
      columnHelper.accessor(
        (row) => row.routeCoordinates[row.routeCoordinates.length - 1].lat,
        {
          id: "latitude",
          header: "Latitud",
          cell: (info) => info.getValue().toFixed(4),
        }
      ),
      columnHelper.accessor(
        (row) => row.routeCoordinates[row.routeCoordinates.length - 1].lng,
        {
          id: "longitude",
          header: "Longitud",
          cell: (info) => info.getValue().toFixed(4),
        }
      ),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: teams,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <VisualError error={error} />;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>Datos de los equipos</h2>
        <div className={styles.searchContainer}>
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.searchInput}
            placeholder="Buscar..."
          />
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    data-label={cell.column.columnDef.header as string}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span>
          Página{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span>
          | Ir a la página:{" "}
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className={styles.pageInput}
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
      <button onClick={() => refetch()} className={styles.refetchButton}>
        Actualizar datos
      </button>
    </div>
  );
};

export default Table;
