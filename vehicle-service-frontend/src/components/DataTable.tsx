import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
}

const DataTable = ({ rows, columns, loading = false }: DataTableProps) => {
  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        loading={loading}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600 },
          "& .MuiDataGrid-cell": { py: 1.5 },
        }}
      />
    </Box>
  );
};

export default DataTable;