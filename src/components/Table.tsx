"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useTeamData, TeamData } from "../utils/api";
import styles from "../styles/Table.module.css";

const Table: React.FC = () => {
  const teams = useTeamData();
  const columnHelper = createColumnHelper<TeamData>();
  const [pageIndex, setPageIndex] = useState(0);

  const columns = React.useMemo(
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
        cell: (info) => {
          const value = info.getValue();
          switch (value) {
            case "family":
              return "Familiar";
            case "short":
              return "Corta";
            case "long":
              return "Larga";
            default:
              return value;
          }
        },
      }),
      columnHelper.accessor("status", {
        header: "Estado",
        cell: (info) => {
          const value = info.getValue();
          switch (value) {
            case "not started":
              return "No iniciado";
            case "in progress":
              return "En progreso";
            case "warning":
              return "Advertencia";
            case "dangerous":
              return "Peligro";
            case "finished":
              return "Finalizado";
            default:
              return value;
          }
        },
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(table.getState().pagination);
        setPageIndex(newState.pageIndex);
      } else {
        setPageIndex(updater.pageIndex);
      }
    },
    state: {
      pagination: {
        pageIndex,
        pageSize: 10,
      },
    },
  });

  if (teams.length === 0) {
    return <div className={styles.loading}>Cargando datos...</div>;
  }

  return (
    <div className={styles.tableContainer}>
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
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
            value={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            style={{ width: "50px" }}
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

export default Table;
