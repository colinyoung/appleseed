export function prepareAddress(address: string): string {
  if (
    !address.endsWith('Chicago, IL') &&
    !address.endsWith('Chicago, IL, USA') &&
    !address.endsWith('Chicago, Illinois, USA')
  ) {
    throw new Error('Address must be in Chicago');
  }
  const parts = address.split(',')[0].split(' ');
  const newAddress = {
    houseNumber: parts[0],
    streetDirection: parts[1].slice(0, 1),
    streetName: parts.slice(2, parts.length - 1).join(' '),
    streetType: streetTypeToAbbreviation(parts[parts.length - 1]),
  };
  return Object.values(newAddress).join(' ');
}

export function streetTypeToAbbreviation(streetType: string): string {
  const streetTypeLower = streetType.toLowerCase();
  if (streetTypeLower === 'avenue' || streetTypeLower === 'ave') {
    return 'Ave';
  }
  if (streetTypeLower === 'street') {
    return 'St';
  }
  if (streetTypeLower === 'market') {
    return 'Mkt';
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
  if (streetTypeLower === 'parkway' || streetTypeLower === 'pkwy') {
    return 'Pkwy';
  }
  if (streetTypeLower === 'expressway' || streetTypeLower === 'expwy') {
    return 'Expwy';
  }
  if (streetTypeLower === 'highway' || streetTypeLower === 'hwy') {
    return 'Hwy';
  }
  if (streetTypeLower === 'circle' || streetTypeLower === 'cir') {
    return 'Cir';
  }
  if (streetTypeLower === 'terrace' || streetTypeLower === 'ter') {
    return 'Ter';
  }
  if (streetTypeLower === 'boulevard' || streetTypeLower === 'blvd') {
    return 'Blvd';
  }
  if (streetTypeLower === 'way' || streetTypeLower === 'wy') {
    return 'Way';
  }
  if (streetTypeLower === 'square' || streetTypeLower === 'sq') {
    return 'Sq';
  }
  return streetType.slice(0, 2);
}
