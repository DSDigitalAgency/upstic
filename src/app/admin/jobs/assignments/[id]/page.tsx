import React from 'react';
import { AssignmentDetailsClient } from './AssignmentDetailsClient';

export default async function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assignmentId = resolvedParams?.id;
  
  return <AssignmentDetailsClient assignmentId={assignmentId} />;
} 