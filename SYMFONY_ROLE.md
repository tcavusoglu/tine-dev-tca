# Die Rolle von Symfony im tine-dev-custom Projekt

## Überblick

Symfony spielt eine **zentrale, aber fokussierte Rolle** in diesem Projekt. Es wird **nicht** als vollständiges Framework eingesetzt, sondern es werden **gezielt einzelne Komponenten** genutzt, um eine professionelle CLI-Anwendung (Command Line Interface) zur Verwaltung der Tine20 Entwicklungsumgebung zu erstellen.

## Eingesetzte Symfony-Komponenten

### 1. Symfony Console (symfony/console v5.2+)
**Die Hauptkomponente des Projekts**

#### Verantwortung:
- **CLI-Framework**: Bildet das Fundament für alle Konsolenbefehle
- **Befehlsstruktur**: Ermöglicht strukturierte, objektorientierte Befehle
- **Input/Output-Verwaltung**: Standardisierte Eingabeverarbeitung und formatierte Ausgabe
- **Auto-Completion**: Integration von Bash-Completion (via stecman/symfony-console-completion)

#### Einsatzorte:

**a) Basis-Application (`console` Datei)**
```php
use Symfony\Component\Console\Application;
```
- Einstiegspunkt der CLI-Anwendung
- Registriert alle verfügbaren Commands (Docker, Tine, Src)
- Startet die Console-Application

**b) Custom ConsoleApplication (`cli/ConsoleApplication.php`)**
```php
class ConsoleApplication extends Application
```
- Erweitert die Standard Symfony Console Application
- Fügt bash-completion Unterstützung hinzu
- Definiert Standard-Commands (Help, List, Completion)

**c) ConsoleStyle (`cli/ConsoleStyle.php`)**
```php
use Symfony\Component\Console\Style\SymfonyStyle;
class ConsoleStyle extends SymfonyStyle
```
- Erweitert SymfonyStyle für konsistente Ausgaben
- Fügt custom Styles hinzu (notice, debug)
- Sorgt für einheitliches Look-and-Feel

**d) BaseCommand (`cli/Commands/BaseCommand.php`)**
```php
use Symfony\Component\Console\Command\Command;
```
- Basisklasse für alle Commands
- Nutzt Symfony Command als Grundlage
- Implementiert gemeinsame Funktionalität (Branch-Management, Pfad-Verwaltung)

**e) Alle spezifischen Commands** (29 Command-Klassen)
- **Docker-Commands** (10): DockerUpCommand, DockerStartCommand, DockerStopCommand, etc.
- **Tine-Commands** (10): TineInstallCommand, TineTestCommand, TineUpdateCommand, etc.
- **Src-Commands** (5): ChangeBranchCommand, ComposerCommand, NpmCommand, etc.

Jeder Command nutzt:
```php
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
```

#### Typische Command-Struktur:
```php
class TineInstallCommand extends TineCommand
{
    protected function configure()
    {
        $this->setName('tine:install')
             ->setDescription('install tine')
             ->addArgument('modules', ...);
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new ConsoleStyle($input, $output);
        // Command-Logik
    }
}
```

### 2. Symfony Yaml (symfony/yaml v5.4+)

#### Verantwortung:
- **Konfigurationsparsing**: Lesen und Verarbeiten von YAML-Konfigurationsdateien
- **Strukturierte Konfiguration**: Ermöglicht hierarchische, lesbare Konfigurationsdateien

#### Einsatzort:
**BaseCommand (`cli/Commands/BaseCommand.php`)**
```php
use Symfony\Component\Yaml\Yaml;

protected function configure()
{
    if (is_file($this->baseDir . '/cli/config.yml')) {
        $this->config = Yaml::parseFile($this->baseDir . '/cli/config.yml');
    }
}
```

- Lädt optionale `cli/config.yml` Konfigurationsdatei
- Macht Konfiguration für alle Commands verfügbar
- Wird für projektspezifische Einstellungen genutzt (z.B. Table-Prefix)

### 3. Symfony Process (symfony/process v5.4+)

#### Verantwortung:
- **Prozessverwaltung**: Ausführung und Verwaltung externer Prozesse
- **Interaktive Prozesse**: Ermöglicht Kommunikation mit laufenden Prozessen

#### Einsatzort:
Aktuell in `composer.json` als Dependency definiert, aber im Code **auskommentiert**:

```php
// cli/Commands/Docker/DockerPullCommand.php
//use Symfony\Component\Process\Process;
```

**Potenzielle Verwendung:**
- Strukturierte Docker-Command-Ausführung
- Prozess-Monitoring und Output-Handling
- Alternative zu `passthru()` und `system()` Aufrufen

Aktuell werden stattdessen PHP's native Funktionen verwendet:
- `passthru()` für interaktive Commands mit Live-Output
- `system()` für einfache Command-Ausführung
- `exec()` für Output-Erfassung

## Architektur-Übersicht

```
console (Einstiegspunkt)
    ↓
ConsoleApplication (extends Symfony\Console\Application)
    ↓
Commands registrieren
    ↓
BaseCommand (extends Symfony\Console\Command)
    ├── verwendet Yaml für Config
    ├── verwendet ConsoleStyle für Output
    └── Basis für alle spezifischen Commands
        ├── DockerCommand → Docker-Management Commands
        ├── TineCommand → Tine20-Management Commands
        └── Weitere Commands
```

## Command-Kategorien und ihre Verantwortung

### Docker-Commands (docker:*)
**Verantwortung**: Docker-Container-Verwaltung für Tine20-Entwicklungsumgebung
- `docker:up` - Setup starten (Images, Container, Netzwerk)
- `docker:start` - Container starten
- `docker:stop` - Container stoppen
- `docker:down` - Setup komplett herunterfahren
- `docker:cli` - Shell in Container öffnen
- `docker:log` - Container-Logs anzeigen
- `docker:webpack-restart` - Webpack-Dev-Server neu starten
- `docker:generate-cert` - TLS-Zertifikate generieren

### Tine-Commands (tine:*)
**Verantwortung**: Tine20-Anwendungsverwaltung
- `tine:install` - Tine20 installieren
- `tine:uninstall` - Tine20 deinstallieren
- `tine:reinstall` - Tine20 neu installieren
- `tine:update` - Tine20 aktualisieren
- `tine:test` - Tests ausführen
- `tine:setup-test` - Setup-Tests ausführen
- `tine:demodata` - Demodaten installieren
- `tine:cli` - Tine20-CLI ausführen
- `tine:setup-cli` - Tine20-Setup-CLI ausführen
- `tine:await-db` - Auf Datenbankverbindung warten
- `tine:clear-cache` - Cache leeren

### Src-Commands (src:*)
**Verantwortung**: Quellcode-Verwaltung
- `src:change-branch` - Git-Branch wechseln
- `src:composer` - Composer-Commands ausführen
- `src:npm` - NPM-Commands ausführen
- `src:npminstall` - NPM-Dependencies installieren
- `src:langhelper` - Sprachdatei-Helper

## Warum Symfony und nicht ein vollständiges Framework?

**Vorteile dieser Architektur:**
1. **Leichtgewichtig**: Nur benötigte Komponenten, kein Framework-Overhead
2. **Professionell**: Nutzt bewährte, gut getestete Komponenten
3. **Standardisiert**: Symfony Console ist de-facto Standard für PHP CLIs
4. **Erweiterbar**: Einfaches Hinzufügen neuer Commands
5. **Wartbar**: Klare Struktur, objektorientiert
6. **Developer-Experience**: Auto-Completion, Help-System, konsistente I/O

**Das Projekt braucht kein vollständiges Symfony-Framework weil:**
- Keine Web-Schicht (HTTP-Requests, Routing, Controller)
- Keine Datenbank-Abstraktion (ORM/Doctrine)
- Keine Template-Engine (Twig)
- Nur CLI-Befehle zur Docker/Tine-Verwaltung

## Zusammenfassung für ein Gespräch

**"Symfony in diesem Projekt in einem Satz:"**
> Wir nutzen gezielt drei Symfony-Komponenten - Console als CLI-Framework, Yaml für Konfiguration und Process für Prozessverwaltung - um eine professionelle, wartbare Kommandozeilenanwendung zur Verwaltung unserer Tine20-Entwicklungsumgebung zu bauen, ohne den Overhead eines vollständigen Frameworks.

**Die drei Kernpunkte:**

1. **Symfony Console (Hauptkomponente)**:
   - Bildet das gesamte CLI-Framework
   - Alle 29 Commands basieren darauf
   - Sorgt für strukturierte, objektorientierte Command-Implementierung
   - Bietet Auto-Completion und Help-System

2. **Symfony Yaml**:
   - Einfaches, menschenlesbares Konfigurationsformat
   - Lädt projektspezifische Einstellungen aus `config.yml`
   - Ermöglicht flexible Konfiguration ohne Code-Änderungen

3. **Symfony Process**:
   - Für professionelle Prozessverwaltung vorgesehen
   - Aktuell durch native PHP-Funktionen ersetzt
   - Könnte für bessere Docker-Command-Verwaltung aktiviert werden

**Architektur-Pattern:**
- "Micro-Framework-Ansatz": Nur was benötigt wird
- Klare Trennung: Docker-Commands, Tine-Commands, Src-Commands
- Vererbungshierarchie: BaseCommand → Spezialisierte Commands
- Dependency Injection durch Symfony Console
