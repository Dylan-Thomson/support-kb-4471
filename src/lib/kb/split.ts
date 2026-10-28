// #4471 split by problem, counted the desk's way: every report under its tenant's cause (causes.ts),
// and the reports the desk read as a one-day move (desk-notes.json) also as a problem of their own.
// Those stay counted under their tenant's cause too, as the desk files them.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  count: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  alsoUnder?: string;
};

function span(rs: Report[]): Pick<ProblemRow, 'tenants' | 'firstSeen' | 'lastSeen'> {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return { tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
}

export function splitTicket(
  rows: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; unique: number; problems: ProblemRow[] } {
  const merged = uniqueById(rows).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const problems: ProblemRow[] = groups.map((g) => ({ problem: g.cause, count: g.reports.length, ...span(g.reports) }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const under = groups.filter((g) => readAs(g, oneDayMove)).map((g) => g.cause);
    problems.push({ problem: 'one-day', count: moved.length, ...span(moved), alsoUnder: under.join(', ') });
  }
  return { rows: rows.filter((r) => r.mergedInto === ticket).length, unique: merged.length, problems };
}
