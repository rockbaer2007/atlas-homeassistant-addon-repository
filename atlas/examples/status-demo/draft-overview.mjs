// Presentation only: never migrate, relabel or write the stored recovery sources.
export function draftOverview(records, query, language, labels) {
  const terms = String(query || "").trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return records.map(record => {
    const timestamp = Date.parse(record.updatedAt);
    const date = Number.isFinite(timestamp) ? new Date(timestamp).toLocaleString(language,
      { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit" }) : labels.unknownTime;
    const association = record.current ? labels.thisTab : record.legacy ? labels.legacy : labels.otherTab;
    const script = record.project.scriptFilename || labels.noScript;
    const source = record.id;
    const text = `${record.project.name} — ${date} · ${association} · ${source.slice(0, 8)}`;
    const searchable = [record.project.name, script, source, date, record.updatedAt || "", association].join(" ").toLocaleLowerCase();
    return { ...record, date, association, script, text,
      matches: terms.every(term => searchable.includes(term)) };
  });
}
