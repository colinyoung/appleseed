import { NextRequest, NextResponse } from 'next/server';
import { prepareAddress } from './_utils';

export async function POST(request: NextRequest) {
  try {
    const { address, numTrees, location, lat, lng } = await request.json();

    // TODO: Add validation
    if (!address || !numTrees) {
      return NextResponse.json(
        { error: 'Address and number of trees are required' },
        { status: 400 },
      );
    }

    const formattedAddress = prepareAddress(address);

    const response = await fetch(`${process.env.API_URL}/tree-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: formattedAddress, numTrees, location, lat, lng }),
    });
    const data = await response.json();
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({
      address,
      numTrees,
      location,
      srNumber: data.srNumber,
      lat,
      lng,
      alreadyExists: data.alreadyExists,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
