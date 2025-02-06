import { describe, expect, test } from '@jest/globals';
import { prepareAddress, streetTypeToAbbreviation } from './_utils';

describe('Tree Request Utils', () => {
  describe('streetTypeToAbbreviation', () => {
    test('should abbreviate common street types', () => {
      expect(streetTypeToAbbreviation('Avenue')).toBe('Ave');
      expect(streetTypeToAbbreviation('Street')).toBe('St');
      expect(streetTypeToAbbreviation('Market')).toBe('Mkt');
      expect(streetTypeToAbbreviation('Road')).toBe('Rd');
      expect(streetTypeToAbbreviation('Drive')).toBe('Dr');
      expect(streetTypeToAbbreviation('Place')).toBe('Pl');
      expect(streetTypeToAbbreviation('Court')).toBe('Ct');
      expect(streetTypeToAbbreviation('Parkway')).toBe('Pkwy');
      expect(streetTypeToAbbreviation('Expressway')).toBe('Expwy');
      expect(streetTypeToAbbreviation('Highway')).toBe('Hwy');
      expect(streetTypeToAbbreviation('Circle')).toBe('Cir');
      expect(streetTypeToAbbreviation('Terrace')).toBe('Ter');
      expect(streetTypeToAbbreviation('Boulevard')).toBe('Blvd');
      expect(streetTypeToAbbreviation('Way')).toBe('Way');
      expect(streetTypeToAbbreviation('Square')).toBe('Sq');
    });

    test('should handle already abbreviated forms', () => {
      expect(streetTypeToAbbreviation('Ave')).toBe('Ave');
      expect(streetTypeToAbbreviation('Pkwy')).toBe('Pkwy');
      expect(streetTypeToAbbreviation('Expwy')).toBe('Expwy');
      expect(streetTypeToAbbreviation('Hwy')).toBe('Hwy');
      expect(streetTypeToAbbreviation('Cir')).toBe('Cir');
      expect(streetTypeToAbbreviation('Ter')).toBe('Ter');
      expect(streetTypeToAbbreviation('Blvd')).toBe('Blvd');
      expect(streetTypeToAbbreviation('Sq')).toBe('Sq');
    });

    test('should handle case insensitivity', () => {
      expect(streetTypeToAbbreviation('AVENUE')).toBe('Ave');
      expect(streetTypeToAbbreviation('street')).toBe('St');
      expect(streetTypeToAbbreviation('Boulevard')).toBe('Blvd');
    });

    test('should return first two letters for unknown street types', () => {
      expect(streetTypeToAbbreviation('Lane')).toBe('La');
      expect(streetTypeToAbbreviation('Path')).toBe('Pa');
      expect(streetTypeToAbbreviation('Loop')).toBe('Lo');
    });
  });

  describe('prepareAddress', () => {
    test('should format valid Chicago addresses', () => {
      expect(prepareAddress('1234 North Western Avenue, Chicago, IL')).toBe('1234 N Western Ave');
      expect(prepareAddress('5678 South Halsted Street, Chicago, IL, USA')).toBe(
        '5678 S Halsted St',
      );
      expect(prepareAddress('910 West Madison Boulevard, Chicago, Illinois, USA')).toBe(
        '910 W Madison Blvd',
      );
    });

    test('should handle different street types', () => {
      expect(prepareAddress('1234 North Western Avenue, Chicago, IL')).toBe('1234 N Western Ave');
      expect(prepareAddress('1234 North Western Street, Chicago, IL')).toBe('1234 N Western St');
      expect(prepareAddress('1234 North Western Road, Chicago, IL')).toBe('1234 N Western Rd');
      expect(prepareAddress('1234 North Western Court, Chicago, IL')).toBe('1234 N Western Ct');
      expect(prepareAddress('1234 North Central Park Avenue, Chicago, IL')).toBe(
        '1234 N Central Park Ave',
      );
    });

    test('should throw error for non-Chicago addresses', () => {
      expect(() => prepareAddress('1234 Main St, New York, NY')).toThrow(
        'Address must be in Chicago',
      );
      expect(() => prepareAddress('1234 Western Ave, Oak Park, IL')).toThrow(
        'Address must be in Chicago',
      );
      expect(() => prepareAddress('1234 Western Ave')).toThrow('Address must be in Chicago');
    });

    test('should handle different Chicago address endings', () => {
      expect(prepareAddress('1234 North Western Avenue, Chicago, IL')).toBe('1234 N Western Ave');
      expect(prepareAddress('1234 North Western Avenue, Chicago, IL, USA')).toBe(
        '1234 N Western Ave',
      );
      expect(prepareAddress('1234 North Western Avenue, Chicago, Illinois, USA')).toBe(
        '1234 N Western Ave',
      );
    });
  });
});
