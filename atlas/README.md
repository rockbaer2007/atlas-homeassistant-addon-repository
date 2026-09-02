# ATLAS Home Assistant App

Dies ist das erste Home-Assistant-App/Add-on-Paket für ATLAS. Es nutzt
dieselbe Laufzeit wie die geprüfte Standalone-Docker-Vorschau:

- ATLAS App-Laufzeit und Health-Endpunkt auf Port `4176`
- ATLAS Administration auf Port `4175`
- Home Assistant Card Editor als Referenz-Plugin auf Port `4174`
- ATLAS File Studio als zweite unabhängige Plugin-Linie

Home Assistant Ingress ist für den ATLAS-App-Port aktiviert. ATLAS öffnet ein
einzelnes aktives Plugin direkt oder zeigt den Plugin-Hub, wenn mehrere Plugins
aktiv sind.

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

## Update-Hinweis

Home Assistant zeigt bei Add-on-Updates manchmal zwei Versionen: `old` ist die
installierte Version, `target` ist die neue Version aus diesem Repository. Wenn
ATLAS hier aktualisiert wurde, sollte `target` mindestens `0.1.97` anzeigen.
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

Home Assistant Ingress is enabled for the ATLAS app port. ATLAS opens the only
active plugin directly or shows the Plugin Hub when multiple plugins are active.

## Add-on connection options

The Add-on configuration can provide the Home Assistant URL, a long-lived access
token, whether ATLAS Administration should import that token on startup and
whether the Card Editor should auto-connect after the handoff.

It also controls the file capabilities for ATLAS File Studio. `/config` remains
the default. Additional approvals for `/config/www`,
`/config/custom_components`, `/addons` and `parent-of-config` can be enabled
separately. Keep administrative approvals disabled for normal editor usage.

The token is shown as text because Home Assistant can mask local password fields
on reload and pass only a shortened placeholder to the Add-on. The token is not
stored permanently by the Card Editor.

## Update note

Home Assistant may show two versions during Add-on updates: `old` is the
installed version, `target` is the new version from this repository. After this
ATLAS update, `target` should be at least `0.1.97`. If Home Assistant still
shows an older target version, reload the repository information in the Add-on
Store and then restart the ATLAS Add-on.
