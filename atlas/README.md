# ATLAS Home Assistant App

Dies ist das erste Home-Assistant-App/Add-on-Paket für ATLAS. Es nutzt
dieselbe Laufzeit wie die geprüfte Standalone-Docker-Vorschau:

- ATLAS App-Laufzeit und Health-Endpunkt auf Port `4176`
- ATLAS Administration auf Port `4175`
- Home Assistant Card Editor als Referenz-Plugin auf Port `4174`
- ATLAS File Studio als zweite unabhängige Plugin-Linie
- ATLAS Automation Exporter / Editor als GitHub-installierbares Plugin

Home Assistant Ingress ist für den ATLAS-App-Port aktiviert. ATLAS öffnet ein
einzelnes aktives Plugin direkt oder zeigt den Plugin-Hub, wenn mehrere Plugins
aktiv sind. Im Plugin-Hub bleiben Fähigkeitslisten und Seitenleisten-URLs
standardmäßig eingeklappt. Der Seitenleisten-Dialog kann wahlweise eine reine
Plugin-URL oder einen fertigen `panel_iframe`-Block kopieren. Administration
und Card Editor sind zusätzlich über App-Routen erreichbar, damit Hub- und
Seitenleisten-Links auch über Home Assistant Ingress und von anderen Rechnern
funktionieren.

## Add-on-Verbindungsoptionen

Die Add-on-Konfiguration kann die Home-Assistant-URL, einen Long-Lived Access
Token, die Übernahme dieses Tokens durch ATLAS Administration beim Start und
die automatische Verbindung des Card Editors nach dem Handoff festlegen.

Außerdem steuert sie die Datei-Fähigkeiten für ATLAS File Studio. `/config`
bleibt der Standard. Zusätzliche Freigaben für `/config/www`,
`/config/custom_components`, `/addons` und `parent-of-config` sind getrennt
schaltbar. Für den normalen Editorbetrieb sollten die administrativen
Freigaben deaktiviert bleiben.

Der Token wird als Passwortfeld angezeigt und von Home Assistant maskiert. Der
Card Editor speichert den Token nicht dauerhaft.

## ATLAS Terminal

Das Terminal-Plugin ist standardmäßig deaktiviert. Für den lokalen Shell-Zugriff
muss `Terminal aktivieren` eingeschaltet und ein zufälliges Zugriffstoken mit
mindestens 32 URL-sicheren Zeichen gesetzt werden. Die Shell läuft mit den
Berechtigungen des Add-ons und kann auf die eingebundenen Pfade zugreifen.
Aktiviere die Funktion nur, wenn du den Zugang wirklich benötigst.
Die lokale Shell enthält außerdem Home-Assistant-CLI (`ha`) und kann mit der
Supervisor-Rolle `manager` Befehle wie `ha core check` ausführen. Behandle den
Terminal-Zugang daher wie administrativen Zugriff auf deinen Home-Assistant-
Supervisor. Der `SUPERVISOR_TOKEN` wird nur an lokale Shell-Sitzungen gegeben,
nicht an konfigurierte SSH-Ziele.

Für ein optionales SSH-Ziel müssen Host, Benutzer, privater Schlüssel und
`known_hosts` konfiguriert werden. Lege Schlüssel und Hostliste unter `/config`
ab und trage ihre absoluten Containerpfade ein, zum Beispiel
`/config/.ssh/id_ed25519` und `/config/.ssh/known_hosts`. Die Hostprüfung bleibt
aktiv; Passwörter und beliebige Ziele aus dem Browser sind nicht erlaubt.

Die Oberfläche bietet ANSI-Farben und eine Schriftgröße von 11 bis 26 px. Die
Schriftgröße wird lokal im Browser gespeichert. Das Zugriffstoken wird ebenfalls
im lokalen Browserspeicher abgelegt und kann in der Terminal-Ansicht gelöscht
werden. Skripte derselben Website können auf diesen Speicher zugreifen; verwende
das Terminal daher nur in einem vertrauenswürdigen Browserprofil.

## Update-Hinweis

Home Assistant zeigt bei Add-on-Updates manchmal zwei Versionen: `old` ist die
installierte Version, `target` ist die neue Version aus diesem Repository. Wenn
ATLAS hier aktualisiert wurde, sollte `target` mindestens `0.1.213` anzeigen.
Falls Home Assistant weiter eine alte Zielversion zeigt, lade im Add-on Store
die Repository-Informationen neu und starte danach das ATLAS Add-on neu.

---

# ATLAS Home Assistant App

This is the first Home Assistant App/Add-on packaging scaffold for ATLAS. It
wraps the same runtime used by the standalone Docker preview:

- ATLAS app runtime and health endpoint on port `4176`
- ATLAS Administration on port `4175`
- Home Assistant Card Editor reference plugin on port `4174`
- ATLAS File Studio as the second independent plugin line
- ATLAS Terminal in the Administration plugin manager and Plugin Hub
- ATLAS Automation Exporter / Editor as a GitHub-installable plugin

Home Assistant Ingress is enabled for the ATLAS app port. ATLAS opens the only
active plugin directly or shows the Plugin Hub when multiple plugins are active.
The Plugin Hub keeps capability lists and sidebar URLs collapsed by default. The
sidebar dialog can copy either a plain plugin URL or a ready-to-use
`panel_iframe` block. Administration and Card Editor are also available through
app routes so Hub and sidebar links work through Home Assistant Ingress and from
other client devices.

## Add-on connection options

The Add-on configuration can provide the Home Assistant URL, a long-lived access
token, whether ATLAS Administration should import that token on startup and
whether the Card Editor should auto-connect after the handoff.

It also controls the file capabilities for ATLAS File Studio. `/config` remains
the default. Additional approvals for `/config/www`,
`/config/custom_components`, `/addons` and `parent-of-config` can be enabled
separately. Keep administrative approvals disabled for normal editor usage.

The token is shown as a password field and masked by Home Assistant. The Card
Editor does not store it permanently.

## ATLAS Terminal

The Terminal plugin is disabled by default. To enable local shell access, turn
on `Enable terminal` and set a random access token of at least 32 URL-safe
characters. The shell runs with the add-on's permissions and can access mounted
paths, so enable it only when needed.

For an optional SSH target, configure the host, username, private key and
`known_hosts` file. Store the key and host list under `/config` and enter their
absolute container paths, for example `/config/.ssh/id_ed25519` and
`/config/.ssh/known_hosts`. Host-key verification remains enabled; passwords
and browser-supplied arbitrary destinations are not allowed.

The UI supports ANSI colors and an 11–26 px font size, saved locally in the
browser. The access token is also stored in this browser's local storage and can
be cleared from the Terminal screen. Same-origin scripts can access this
storage, so use the terminal only in a trusted browser profile.
The local shell includes the Home Assistant CLI (`ha`) and receives the
Supervisor `manager` role needed for commands such as `ha core check`. Treat
terminal access as administrative access to the Home Assistant Supervisor. The
`SUPERVISOR_TOKEN` is passed only to local shell sessions, never configured SSH
targets.

## Update note

Home Assistant may show two versions during Add-on updates: `old` is the
installed version, `target` is the new version from this repository. After this
ATLAS update, `target` should be at least `0.1.213`. If Home Assistant still
shows an older target version, reload the repository information in the Add-on
Store and then restart the ATLAS Add-on.
