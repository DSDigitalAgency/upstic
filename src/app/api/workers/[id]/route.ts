import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workerId } = await params;
    const update = await request.json();
    
    // Read existing workers
    const workersFilePath = path.join(process.cwd(), 'src', 'demo', 'data', 'workers.json');
    let workers = [];
    
    try {
      const workersData = await fs.readFile(workersFilePath, 'utf-8');
      workers = JSON.parse(workersData);
    } catch {
      return NextResponse.json(
        { error: 'Failed to load workers' },
        { status: 500 }
      );
    }

    // Find and update the worker
    const workerIndex = workers.findIndex((w: Record<string, unknown>) => w.id === workerId);
    if (workerIndex === -1) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Update the worker
    workers[workerIndex] = {
      ...workers[workerIndex],
      ...update,
      updatedAt: new Date().toISOString()
    };

    // Write back to file
    await fs.writeFile(workersFilePath, JSON.stringify(workers, null, 2));

    return NextResponse.json(workers[workerIndex]);
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json(
      { error: 'Failed to update worker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workerId } = await params;
    
    // Read existing workers
    const workersFilePath = path.join(process.cwd(), 'src', 'demo', 'data', 'workers.json');
    let workers = [];
    
    try {
      const workersData = await fs.readFile(workersFilePath, 'utf-8');
      workers = JSON.parse(workersData);
    } catch {
      return NextResponse.json(
        { error: 'Failed to load workers' },
        { status: 500 }
      );
    }

    // Find and remove the worker
    const workerIndex = workers.findIndex((w: Record<string, unknown>) => w.id === workerId);
    if (workerIndex === -1) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Remove the worker
    workers.splice(workerIndex, 1);

    // Write back to file
    await fs.writeFile(workersFilePath, JSON.stringify(workers, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json(
      { error: 'Failed to delete worker' },
      { status: 500 }
    );
  }
}
