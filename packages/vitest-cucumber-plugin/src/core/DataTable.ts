/**
 * DataTable for parsing phase (simplified version)
 * This is used during feature file parsing to hold table data.
 * The runtime DataTable with full functionality is in the API package.
 */
export class DataTable {
  private rows: string[][];

  constructor(rows: string[][]) {
    this.rows = rows;
  }

  /**
   * Get raw table data
   */
  public raw(): string[][] {
    return this.rows;
  }
}
