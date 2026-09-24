# ATLAS Home Assistant Add-on Repository

Installierbares Home-Assistant-Add-on-Repository für ATLAS Administration und
den ATLAS Home Assistant Card Editor, ATLAS File Studio, ATLAS Automation
Exporter / Editor und das optionale ATLAS Terminal.

[![Open your Home Assistant instance and show the add repository dialog.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Frockbaer2007%2Fatlas-homeassistant-addon-repository)

Repository-URL für Home Assistant:

```text
https://github.com/rockbaer2007/atlas-homeassistant-addon-repository
```

Aktuelles Add-on:

- Name: ATLAS
- Slug: `atlas`
- Version: `0.1.206`

Das Terminal ist standardmäßig deaktiviert und benötigt ein serverseitiges
Zugriffstoken. Es bietet eine lokale Shell und optional ein fest konfiguriertes
SSH-Ziel mit Hostschlüsselprüfung. Das Token kann lokal im Browser gespeichert
und über die Terminal-Oberfläche wieder gelöscht werden.

Der Plugin-Hub kann aktive Plugins direkt öffnen, bei mehreren Plugins eine
Auswahl anzeigen und Seitenleisten-URLs beziehungsweise `panel_iframe`-YAML
für Home Assistant kopieren. Lange Fähigkeitslisten und Seitenleisten-URLs sind
in den Plugin-Karten standardmäßig eingeklappt. Administration, Card Editor und
Plugin-Assets laufen über ATLAS-App-Routen, damit Hub- und Seitenleisten-Links
auch über Home Assistant Ingress und von anderen Rechnern funktionieren.
