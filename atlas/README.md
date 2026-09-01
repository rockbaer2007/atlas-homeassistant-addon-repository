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

## Installation aus GitHub

Füge das öffentliche ATLAS Add-on-Repository in Home Assistant hinzu:

```text
https://github.com/rockbaer2007/atlas-homeassistant-addon-repository
```

Öffne **Einstellungen -> Add-ons -> Add-on Store -> Repositories**, füge die
URL ein, aktualisiere den Store und installiere **ATLAS**.

Für die My-Home-Assistant-Hilfsseite kannst du diesen Link nutzen:

```text
https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Frockbaer2007%2Fatlas-homeassistant-addon-repository
```

## Lokaler Test

Die lokale Docker- und Smoke-Test-Anleitung liegt im ATLAS-Quellrepository:

```text
https://github.com/rockbaer2007/atlas
```

Dieses Repository hier ist für die installierbare Home-Assistant-App gedacht.

## Home Assistant Seitenleiste

Der bevorzugte Weg ist **Einstellungen -> Add-ons -> ATLAS -> In Seitenleiste
anzeigen**. Dadurch öffnet Home Assistant ATLAS über Ingress. ATLAS öffnet
ein einzelnes aktives Plugin direkt oder zeigt den Plugin-Hub, wenn mehrere
Plugins aktiv sind.

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
