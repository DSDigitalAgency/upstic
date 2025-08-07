import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const preferencesData = await request.json();
    
    // Create new preferences with the provided data
    const newPreferences = {
      id: preferencesData.id || `pref-${Date.now()}`,
      workerId: preferencesData.workerId || preferencesData.userId,
      notifications: preferencesData.notifications || {
        email: true,
        sms: false,
        push: true,
      },
      privacy: preferencesData.privacy || {
        profileVisibility: 'PUBLIC',
        showContactInfo: true,
      },
      preferences: preferencesData.preferences || {
        preferredShiftType: [],
        maxTravelDistance: 50,
        minimumHourlyRate: 0,
      },
      createdAt: preferencesData.createdAt || new Date().toISOString(),
      updatedAt: preferencesData.updatedAt || new Date().toISOString(),
    };

    // Read existing preferences
    const preferencesFilePath = path.join(process.cwd(), 'src', 'demo', 'data', 'preferences.json');
    let preferences = [];
    
    try {
      const preferencesData = await fs.readFile(preferencesFilePath, 'utf-8');
      preferences = JSON.parse(preferencesData);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      preferences = [];
    }

    // Add new preferences
    preferences.push(newPreferences);

    // Write back to file
    await fs.writeFile(preferencesFilePath, JSON.stringify(preferences, null, 2));

    return NextResponse.json(newPreferences);
  } catch (error) {
    console.error('Error creating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to create preferences' },
      { status: 500 }
    );
  }
}
