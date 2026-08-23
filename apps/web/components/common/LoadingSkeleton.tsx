'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

export function TableSkeletonRows({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <TableContainer>
      <Table>
        <TableBody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <TableRow key={rIdx}>
              {Array.from({ length: cols }).map((_, cIdx) => (
                <TableCell key={cIdx}>
                  <Skeleton
                    variant="text"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      width: cIdx === 0 ? '70%' : cIdx === 1 ? '40%' : '80%',
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card
          key={idx}
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '60%' }}>
            <Skeleton
              variant="text"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                width: '40%',
                height: 24,
                mb: 1,
              }}
            />
            <Skeleton
              variant="text"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', width: '70%' }}
            />
          </Box>
          <Skeleton
            variant="rectangular"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              width: 80,
              height: 26,
              borderRadius: 1,
            }}
          />
        </Card>
      ))}
    </Box>
  );
}
