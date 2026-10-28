<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket, type Problem } from '#lib/kb/split';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket, filed }: { ticket: number; filed: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.unique}</strong> reports in #{ticket} ({split.rows} export rows, {split.rows - split.unique} repeated) ·
  <strong>{split.problems.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.problems as p (p.problem)}
      <tr>
        <td><code>{p.problem}</code></td>
        <td>{p.count}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if p.problem !== 'unplaced' && filed[p.problem]}<a href={filed[p.problem]}>{filed[p.problem]?.replace(/.*\/issues\//, '#')}</a>{:else}—{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.problems as p (p.problem)}
  {#if p.alsoUnder}
    <p class="note">The {p.count} <code>{p.problem}</code> reports are also counted under <code>{p.alsoUnder}</code>, where the desk files them by tenant.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
