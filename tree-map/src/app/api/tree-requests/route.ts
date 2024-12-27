import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address, numTrees, location } = await request.json();

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
      body: JSON.stringify({ address: formattedAddress, numTrees, location }),
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

function prepareAddress(address: string): string {
  if (!address.endsWith('Chicago, IL, USA')) {
    throw new Error('Address must be in Chicago');
  }
  const parts = address.split(',')[0].split(' ');
  const newAddress = {
    houseNumber: parts[0],
    streetDirection: parts[1].slice(0, 1),
    streetName: parts[2],
    streetType: streetTypeToAbbreviation(parts[3]),
  };
  return Object.values(newAddress).join(' ');
}

function streetTypeToAbbreviation(streetType: string): string {
  const streetTypeLower = streetType.toLowerCase();
  if (streetTypeLower === 'avenue') {
    return 'Ave';
  }
  if (streetTypeLower === 'street') {
    return 'St';
  }
  if (streetTypeLower === 'road') {
    return 'Rd';
  }
  if (streetTypeLower === 'drive') {
    return 'Dr';
  }
  if (streetTypeLower === 'place') {
    return 'Pl';
  }
  if (streetTypeLower === 'court') {
    return 'Ct';
  }
  if (streetTypeLower === 'parkway') {
    return 'Pkwy';
  }
  if (streetTypeLower === 'expressway') {
    return 'Expwy';
  }
  if (streetTypeLower === 'highway') {
    return 'Hwy';
  }
  if (streetTypeLower === 'circle') {
    return 'Cir';
  }
  if (streetTypeLower === 'terrace') {
    return 'Ter';
  }
  if (streetTypeLower === 'boulevard') {
    return 'Blvd';
  }
  if (streetTypeLower === 'way') {
    return 'Way';
  }
  if (streetTypeLower === 'square') {
    return 'Sq';
  }
  return streetType.slice(0, 2);
}
