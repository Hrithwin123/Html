import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB and fetch user's networks
    await client.connect();
    const db = client.db('persona_app');
    const networksCollection = db.collection('networks');

    // Get the most recent network for the user
    const network = await networksCollection
      .findOne(
        { userId },
        { sort: { createdAt: -1 } }
      );

    await client.close();

    if (!network) {
      return NextResponse.json(
        { error: 'No networks found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      networkId: network._id,
      personas: network.personas,
      societyType: network.societyType,
      createdAt: network.createdAt,
      personaCount: network.personaCount
    });

  } catch (error: any) {
    console.error('Error fetching network:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network: ' + error.message },
      { status: 500 }
    );
  }
}