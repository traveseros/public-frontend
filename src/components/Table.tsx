import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  FilterFn,
} from "@tanstack/react-table";
import { TeamData, RouteType, TeamStatus } from "@/types/global";
import {
  getRouteDisplayName,
  getStatusDisplayName,
  getStatusIcon,
} from "@/app/lib/teams/utils";
import styles from "../styles/Table.module.css";

interface LazyTableProps {
  teams: TeamData[];
}

const LazyTable: React.FC<LazyTableProps> = ({ teams }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const columnHelper = createColumnHelper<TeamData>();

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
        cell: (info) => getRouteDisplayName(info.getValue()),
      }),
      columnHelper.accessor("status", {
        header: "Estado",
        cell: (info) => (
          <>
            {getStatusIcon(info.getValue())}{" "}
            {getStatusDisplayName(info.getValue())}
          </>
        ),
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

  const fuzzyFilter: FilterFn<TeamData> = (row, columnId, value) => {
    const itemValue = row.getValue(columnId);
    const searchValue = value.toLowerCase();

    if (typeof itemValue === "number") {
      return itemValue.toString().toLowerCase().includes(searchValue);
    }

    if (typeof itemValue === "string") {
      return itemValue.toLowerCase().includes(searchValue);
    }

    if (columnId === "route") {
      return getRouteDisplayName(itemValue as RouteType)
        .toLowerCase()
        .includes(searchValue);
    }

    if (columnId === "status") {
      return getStatusDisplayName(itemValue as TeamStatus)
        .toLowerCase()
        .includes(searchValue);
    }

    return false;
  };

  const table = useReactTable({
    data: teams,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: fuzzyFilter,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>Datos de los equipos</h2>
        <div className={styles.searchContainer}>
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.searchInput}
            placeholder="Buscar en todos los campos..."
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
    </div>
  );
};

export default LazyTable;
