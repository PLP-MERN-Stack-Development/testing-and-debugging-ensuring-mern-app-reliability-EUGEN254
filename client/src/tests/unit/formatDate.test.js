// src/tests/unit/formatDate.test.js
import { formatDate, formatDateTime } from '../../utils/formatDate';

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const dateString = '2023-12-25';
    const formatted = formatDate(dateString);
    expect(formatted).toBe('December 25, 2023');
  });

  it('should return empty string for null input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('should return "Invalid Date" for invalid date string', () => {
    expect(formatDate('invalid-date')).toBe('Invalid Date');
  });

  it('should handle different date formats', () => {
    expect(formatDate('2023-01-01')).toBe('January 1, 2023');
    expect(formatDate('2023-06-15')).toBe('June 15, 2023');
  });
});

describe('formatDateTime', () => {
  it('should format date time string correctly', () => {
    const dateString = '2023-12-25T14:30:00';
    const formatted = formatDateTime(dateString);
    // The exact format might vary by environment, so check for partial matches
    expect(formatted).toContain('Dec 25, 2023');
    expect(formatted).toContain('2:30');
  });

  it('should return empty string for null input', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
    expect(formatDateTime('')).toBe('');
  });

  it('should return "Invalid Date" for invalid date string', () => {
    expect(formatDateTime('invalid-date')).toBe('Invalid Date');
  });
});