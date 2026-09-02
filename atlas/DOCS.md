# ATLAS

ATLAS starts Administration and the Home Assistant Card Editor together.

Open the web UI after starting the app. The runtime page shows app links,
health status, surface ports and the planned distribution order.
The `/app` endpoint reports this package as `home-assistant-app-preview`.
The Add-on enables Home Assistant Ingress on the ATLAS app port. ATLAS then
opens the only active plugin directly or shows the Plugin Hub when multiple
plugins are active.
The packaged preview also includes ATLAS Automation Exporter / Editor as a
safe first automation workflow plugin. It can analyze `/config/automations.yaml`
through the approved File Studio path or uploaded YAML files, export selected
automations with timestamped filenames and hand users over to File Studio for
editing.

The Home Assistant token and translation provider keys stay in ATLAS
Administration. The Card Editor receives only the current browser session
handoff and provider key-configured flags.
The Add-on options can provide the Home Assistant URL, a long-lived access
token, whether ATLAS Administration should import that token on startup and
whether the Card Editor should auto-connect after the handoff.

File Studio path approvals are also Add-on options. `/config` is the default
scope. `/config/www`, `/config/custom_components`, `/addons` and
`parent-of-config` are separate capabilities. In Home Assistant App/Add-on
mode, Administration shows these approvals as read-only because the effective
permissions come from the Add-on configuration. In standalone Docker or Linux
mode, the same approvals can be managed in Atlas Administration.

ATLAS keeps a stable app identity through the `atlas_instance_id` option. Use a
deliberate value when encrypted Administration secrets should survive app
rebuilds or container recreation on the same Home Assistant installation.

## Editor als Dashboard/Webseite einbinden

Der bevorzugte Add-on-Weg ist **Einstellungen -> Add-ons -> ATLAS -> In
Seitenleiste anzeigen**. Home Assistant oeffnet dann ATLAS ueber Ingress.
Wenn nur ein Plugin aktiv ist, startet ATLAS dieses Plugin direkt; ab zwei
aktiven Plugins erscheint die optische Plugin-Auswahl.

Alternativ kannst du den ATLAS Card Editor wie ioBroker, FHEM oder andere
lokale Web-UIs als Webseiten-Dashboard anzeigen:

1. Gehe zu **Einstellungen -> Dashboards**.
2. Waehle **Dashboard hinzufuegen**.
3. Waehle den Typ **Webseite**.
4. Name: `Atlas Card Editor`.
5. URL: nutze die ATLAS-App-URL, zum Beispiel
   `http://<home-assistant-host>:4176/`.
6. Aktiviere **In Seitenleiste anzeigen** und speichere das Dashboard.

ATLAS oeffnet sich dann direkt im Home-Assistant-Inhalt. Bei einem aktiven
Plugin wird der Editor direkt geladen; bei mehreren aktiven Plugins zeigt ATLAS
den Plugin Hub. ATLAS Administration bleibt ueber den Link im Editor erreichbar.
Home-Assistant-Token und Provider-API-Keys bleiben in ATLAS Administration
beziehungsweise in den Add-on-Optionen und werden nicht dauerhaft im Editor
gespeichert.

## Home-Assistant-Token in den Add-on-Optionen

Trage in der Add-on-Konfiguration die Home-Assistant-URL und optional einen
Long-Lived Access Token ein. Aktiviere **Token in ATLAS Administration
uebernehmen**, wenn ATLAS den Token beim Start an die Administration uebergeben
soll. Aktiviere **Card Editor automatisch verbinden**, wenn der Editor nach dem
Handoff direkt verbinden soll.

Der Token wird bewusst als Textfeld angezeigt. Home Assistant kann lokale
Password-Felder beim Wiederladen maskieren und dann nur einen gekuerzten
Platzhalter an das Add-on uebergeben. ATLAS ignoriert solche zu kurzen oder
maskierten Werte beim Start. Der Token wird nicht dauerhaft im Card Editor
gespeichert. Administration bleibt der Besitzer der Verbindungseinstellungen.

## Home-Assistant-Update-Ablauf

Nach jedem sichtbaren ATLAS-Update wird die Add-on-Version in diesem Repository
erhoeht. Home Assistant vergleicht die installierte Version (`old`) mit der
Repository-Version (`target`). Fuer diesen Stand ist `target` mindestens
`0.1.97`.

Wenn Home Assistant weiterhin eine alte Zielversion zeigt:

1. Oeffne **Einstellungen -> Add-ons -> Add-on Store**.
2. Lade die Repositories neu oder entferne/fuege das ATLAS Repository erneut
   hinzu.
3. Oeffne das ATLAS Add-on, installiere/aktualisiere die neue Version und
   starte ATLAS neu.
4. Pruefe danach `/app` oder `/health`, ob die neue Laufzeit aktiv ist.

## Add Editor as Dashboard/Webpage

The preferred Add-on path is **Settings -> Add-ons -> ATLAS -> Show in
sidebar**. Home Assistant then opens ATLAS through Ingress. ATLAS opens the only
active plugin directly or shows the Plugin Hub when multiple plugins are active.

Alternatively, go to **Settings -> Dashboards**, add a **Webpage** dashboard, use
`ATLAS` as the name and set the URL to the app endpoint, for example
`http://<home-assistant-host>:4176/`. Enable **Show in sidebar** before saving.

## Home Assistant Token in Add-on Options

Enter the Home Assistant URL and optionally a long-lived access token in the
Add-on configuration. Enable **Import token into ATLAS Administration** when
ATLAS should pass the token to Administration on startup. Enable
**Auto-connect Card Editor** when the editor should connect immediately after
the handoff.

The token is intentionally shown as a text field. Home Assistant can mask local
password fields on reload and pass only a shortened placeholder to the Add-on.
ATLAS ignores masked or implausibly short token values during startup. The token
is not stored permanently by the Card Editor. Administration remains the owner
of the connection settings.

## Home Assistant Update Flow

Every visible ATLAS update bumps the Add-on version in this repository. Home
Assistant compares the installed version (`old`) with the repository version
(`target`). For this build, `target` should be at least `0.1.97`.

If Home Assistant still shows an older target version:

1. Open **Settings -> Add-ons -> Add-on Store**.
2. Reload repositories or remove and add the ATLAS repository again.
3. Open the ATLAS Add-on, install/update the new version and restart ATLAS.
4. Check `/app` or `/health` to confirm the new runtime is active.
