'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Assignment } from '@/lib/api';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AssignmentsListProps {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  emptyMessage?: string;
}

export default function AssignmentsList({ 
  assignments, 
  isLoading, 
  error, 
  emptyMessage = "No assignments found" 
}: AssignmentsListProps) {
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>Error: {error}</p>
        <p className="text-sm mt-1">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  // Render empty state
  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Get shift type badge color
  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'DAY':
        return 'bg-blue-100 text-blue-800';
      case 'NIGHT':
        return 'bg-indigo-100 text-indigo-800';
      case 'EVENING':
        return 'bg-purple-100 text-purple-800';
      case 'WEEKEND':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  <div>{assignment.title}</div>
                  <div className="text-sm text-gray-500">{assignment.location}</div>
                </TableCell>
                <TableCell>
                  <div>{assignment.facility.name}</div>
                  <div className="text-sm text-gray-500">{assignment.facility.type}</div>
                </TableCell>
                <TableCell>
                  <div>{formatDate(assignment.startDate)}</div>
                  <div className="text-sm text-gray-500">to {formatDate(assignment.endDate)}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getShiftTypeColor(assignment.shiftType)}`}>
                    {assignment.shiftType}
                  </span>
                </TableCell>
                <TableCell>
                  {formatCurrency(assignment.hourlyRate)}/hr
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={`/worker/assignments/${assignment.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 