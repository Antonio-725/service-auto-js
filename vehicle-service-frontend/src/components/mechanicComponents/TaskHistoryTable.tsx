import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

interface Task {
  id: string;
  vehicle: {
    make: string;
    model: string;
    plate: string;
  };
  serviceType?: string;
  date: string;
  status: string;
}

interface TaskHistoryTableProps {
  tasks: Task[];
}

const TaskHistoryTable: React.FC<TaskHistoryTableProps> = ({ tasks }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'primary.light' }}>
          <TableRow>
            <TableCell>Vehicle</TableCell>
            <TableCell>Service Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} hover>
              <TableCell>
                <Typography fontWeight="medium">
                  {task.vehicle.make} {task.vehicle.model}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.vehicle.plate}
                </Typography>
              </TableCell>
              <TableCell>{task.serviceType || 'N/A'}</TableCell>
              <TableCell>
                {new Date(task.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={task.status}
                  color={task.status === 'Completed' ? 'success' : 'error'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    minWidth: 80,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskHistoryTable;