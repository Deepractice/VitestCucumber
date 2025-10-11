import { describe, it, expect } from 'vitest';
import { DataTable } from '../core/runtime/DataTable';

describe('DataTable', () => {
  it('should create DataTable from raw rows', () => {
    const rows = [
      ['name', 'age'],
      ['Alice', '30'],
      ['Bob', '25'],
    ];

    const table = new DataTable(rows);

    expect(table.raw()).toEqual(rows);
  });

  it('should return raw rows', () => {
    const rows = [
      ['header1', 'header2'],
      ['value1', 'value2'],
    ];

    const table = new DataTable(rows);

    expect(table.raw()).toEqual(rows);
  });

  it('should return all rows', () => {
    const rows = [
      ['name', 'age'],
      ['Alice', '30'],
      ['Bob', '25'],
    ];

    const table = new DataTable(rows);

    // rows() returns all rows (same as raw())
    expect(table.rows()).toEqual(rows);
  });

  it('should return hashes (array of objects)', () => {
    const rows = [
      ['name', 'age', 'city'],
      ['Alice', '30', 'NYC'],
      ['Bob', '25', 'LA'],
    ];

    const table = new DataTable(rows);

    expect(table.hashes()).toEqual([
      { name: 'Alice', age: '30', city: 'NYC' },
      { name: 'Bob', age: '25', city: 'LA' },
    ]);
  });

  it('should handle empty table', () => {
    const table = new DataTable([]);

    expect(table.raw()).toEqual([]);
    expect(table.rows()).toEqual([]);
    expect(table.hashes()).toEqual([]);
  });

  it('should handle single row (header only)', () => {
    const rows = [['name', 'age']];

    const table = new DataTable(rows);

    expect(table.raw()).toEqual(rows);
    expect(table.rows()).toEqual(rows); // rows() returns all rows
    expect(table.hashes()).toEqual([]); // hashes() treats first row as header
  });

  it('should get row count', () => {
    const rows = [
      ['name', 'age'],
      ['Alice', '30'],
      ['Bob', '25'],
    ];

    const table = new DataTable(rows);

    // DataTable doesn't have rowsCount(), use raw().length
    expect(table.raw().length).toBe(3);
    expect(table.hashes().length).toBe(2); // Excludes header
  });
});
