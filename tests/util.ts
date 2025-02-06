export const VALID_ADDRESSES = [
  '123 N Main St',
  '10800 S Western Ave',
  '1 S Dearborn St',
  '2000 N Broadway',
  '4000 N Central Park Ave',
];

export const getRandomValidAddress = () => {
  return VALID_ADDRESSES[Math.floor(Math.random() * VALID_ADDRESSES.length)];
};
