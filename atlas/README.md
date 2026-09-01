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

Außerdem steuert sie, ob ATLAS File Studio auf `/addons` zugreifen darf. Für
den normalen Editorbetrieb sollte diese Option deaktiviert bleiben. Aktiviere
sie nur, wenn du lokale Home-Assistant-Add-on-Ordner bewusst prüfen oder
bearbeiten möchtest.

Der Token wird als Passwortfeld angezeigt und von Home Assistant maskiert. Der
Card Editor speichert den Token nicht dauerhaft.

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

It also controls whether ATLAS File Studio may access `/addons`. Keep this
disabled for normal editor usage. Enable it only when you intentionally want to
inspect or edit local Home Assistant add-on folders.

The token is shown as text because Home Assistant can mask local password fields
on reload and pass only a shortened placeholder to the Add-on. The token is not
stored permanently by the Card Editor.
