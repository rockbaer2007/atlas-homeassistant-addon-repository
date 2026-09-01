# ATLAS NotifyArchive

NotifyArchive collects Home Assistant messages, stores printable archive
records and decides when a message batch should be printed, mailed, backed up
or escalated.

The first implementation is intentionally transport-independent. IPP printing,
PDF rendering, SFTP upload and e-mail delivery can be attached as adapters
after the rules are stable.

## Initial capabilities

- alarm, notification and entity outage messages
- fixed alarm text or normal notification text per rule
- priority levels from info to alarm
- print modes for immediate, timed, page-full and archive-only batches
- normal mode and vacation mode
- local archive and SFTP retention settings
- acknowledgement rules per message kind or entity
- escalation only for acknowledgement-required messages
- printer target selection by configured printer id
