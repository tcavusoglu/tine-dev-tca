# Tine20 Backend Architektur - Kompakte Analyse

## Überblick
Tine20 ist eine moderne Groupware-Anwendung basierend auf PHP (Backend) und ExtJS (Frontend). Die Architektur folgt dem klassischen MVC-Pattern mit mehreren zusätzlichen Architekturschichten.

## Architektur-Schichten

### 1. **Server-Schicht** (Entry Points & Routing)
**Dateien:** `index.php`, `Tinebase/Server/*.php`

- **Entry Point:** `index.php` ist der zentrale Einstiegspunkt für alle Web-Requests
- **Dispatcher:** `Tinebase_Core::dispatchRequest()` routet Requests zu passenden Server-Implementierungen
- **Server-Typen:**
  - `Tinebase_Server_Json`: JSON-RPC Server für AJAX-Requests (Hauptkommunikation)
  - `Tinebase_Server_Http`: HTTP Server für statische Requests
  - `Tinebase_Server_WebDAV`: WebDAV-Protokoll Support
  - `ActiveSync_Server_Http`: ActiveSync für Mobile-Sync

**Design Pattern:** Front Controller Pattern

### 2. **Frontend-Schicht** (API Interface)
**Dateien:** `Tinebase/Frontend/*.php`

Diese Schicht stellt verschiedene API-Interfaces bereit:

- **Frontend/Json.php**: JSON-RPC API Interface
  - Verarbeitet JSON-RPC 2.0 Requests
  - Jede Applikation hat eigenes Frontend (z.B. `ExampleApplication/Frontend/Json.php`)
  - Methoden werden automatisch via Reflection als RPC-Methoden exponiert
  
- **Frontend/Http.php**: HTTP Interface für File-Downloads, etc.
- **Frontend/Cli.php**: Command-Line Interface
- **Frontend/WebDAV.php**: WebDAV Interface

**Design Pattern:** Facade Pattern - Frontend-Klassen verbergen komplexe Backend-Logik

### 3. **Controller-Schicht** (Business Logic)
**Dateien:** `Tinebase/Controller/*.php`, `{App}/Controller/*.php`

Die zentrale Business-Logic-Schicht:

**Basis-Controller:**
- `Tinebase_Controller_Record_Abstract`: Basisklasse für alle Record-Controller
  - Implementiert CRUD-Operationen (Create, Read, Update, Delete)
  - ACL-Checks (Access Control Lists)
  - Event-Handling
  - Relation-Management
  - Custom Fields
  - Notifications

**App-spezifische Controller:**
```php
class ExampleApplication_Controller_ExampleRecord 
    extends Tinebase_Controller_Record_Abstract
{
    use Tinebase_Controller_SingletonTrait;
    
    protected $_applicationName = 'ExampleApplication';
    protected $_modelName = ExampleApplication_Model_ExampleRecord::class;
    protected $_backend; // Backend-Instanz
}
```

**Design Patterns:**
- **Singleton Pattern**: Jeder Controller ist ein Singleton (`getInstance()`)
- **Template Method Pattern**: Abstract-Methoden wie `_handleEvent()` für Erweiterungen
- **Observer Pattern**: Event-System für Record-Lifecycle (Create, Update, Delete)

### 4. **Backend-Schicht** (Data Access Layer)
**Dateien:** `Tinebase/Backend/*.php`

Abstrahiert den Datenbankzugriff:

**Hauptklassen:**
- `Tinebase_Backend_Sql`: Standard SQL Backend
- `Tinebase_Backend_Sql_Abstract`: Basis mit CRUD-Operationen

**Funktionen:**
- Direkte Datenbank-Operationen (via Zend_Db)
- Keine Business-Logic (nur Datenzugriff)
- SQL-Query-Building
- Transaction-Management

**Design Pattern:** Data Mapper Pattern

### 5. **Model-Schicht** (Domain Models)
**Dateien:** `Tinebase/Model/*.php`, `{App}/Model/*.php`

**Model-Konfiguration:**
Tine20 nutzt ein modernes, konfigurationsbasiertes Modell-System:

```php
class ExampleApplication_Model_ExampleRecord extends Tinebase_Record_NewAbstract
{
    protected static $_modelConfiguration = [
        self::APP_NAME => 'ExampleApplication',
        self::MODEL_NAME => 'ExampleRecord',
        self::TABLE => ['name' => 'example_application_record'],
        self::FIELDS => [
            'name' => [
                self::TYPE => self::TYPE_STRING,
                self::LENGTH => 255,
                self::VALIDATORS => [...],
            ],
            'status' => [
                self::TYPE => self::TYPE_KEY_FIELD, // Lookups
            ],
        ],
        self::HAS_RELATIONS => true,
        self::HAS_CUSTOM_FIELDS => true,
        self::HAS_TAGS => true,
        self::MODLOG_ACTIVE => true, // Änderungsprotokoll
    ];
}
```

**Features:**
- Validierung
- Typ-Konvertierung
- Relationen zwischen Records
- Custom Fields (dynamische Felder)
- Tags und Notes
- Modification Log (Audit Trail)

**Design Pattern:** Active Record Pattern (erweitert mit Configuration)

## Backend-Frontend Kommunikation

### JSON-RPC 2.0 über Ext.Direct

**Request-Flow:**
```
Frontend (ExtJS) 
  → JSON-RPC Request
    → index.php 
      → Tinebase_Server_Json
        → Frontend/Json (method routing)
          → Controller (business logic)
            → Backend (data access)
              → Database
```

**JSON-RPC Request Beispiel:**
```json
{
  "jsonrpc": "2.0",
  "method": "ExampleApplication.searchExampleRecords",
  "params": {
    "filter": [...],
    "paging": {"start": 0, "limit": 50}
  },
  "id": 1
}
```

**JSON-RPC Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "results": [...],
    "totalcount": 100
  }
}
```

### Frontend-Integration (JavaScript)

**Ext.Direct Provider:**
```javascript
// JsonRpcProvider in Tinebase/js/ux/Direct/JsonRpcProvider.js
Ext.Direct.addProvider({
    type: 'jsonrpcprovider',
    url: '/index.php',
    namespace: 'Tine'
});

// Automatischer API-Call
Tine.ExampleApplication.searchExampleRecords(filter, paging, callback);
```

**Record Proxy:**
```javascript
// RecordProxy in Tinebase/js/data/RecordProxy.js
var proxy = new Tine.Tinebase.data.RecordProxy({
    appName: 'ExampleApplication',
    modelName: 'ExampleRecord',
    recordClass: Tine.ExampleApplication.Model.ExampleRecord
});

// CRUD-Operationen werden automatisch zu JSON-RPC Calls
```

## Verwendete Design Patterns (Zusammenfassung)

### 1. **Singleton Pattern**
- Alle Controller (via `Tinebase_Controller_SingletonTrait`)
- Core-Services (`Tinebase_Core`)
- Verhindert mehrfache Instanziierung

### 2. **Factory Pattern**
- `Tinebase_Record_RecordSetAbstract` für Record-Collections
- Application-Factories für dynamisches Laden

### 3. **Observer Pattern**
- Event-System: `Tinebase_Event_Abstract`
- Record-Lifecycle Events (Create, Update, Delete)
- `Tinebase_Controller_Event` als Basis

```php
protected function _handleEvent(Tinebase_Event_Abstract $_eventObject)
{
    switch(get_class($_eventObject)) {
        case 'Tinebase_Event_Record_Update':
            // Reagiere auf Update
            break;
    }
}
```

### 4. **Strategy Pattern**
- Backend-Austauschbarkeit (SQL, LDAP, etc.)
- Frontend-Varianten (Json, Http, Cli, WebDAV)

### 5. **Facade Pattern**
- Frontend-Schicht vereinfacht Zugriff auf komplexe Controller-Logic
- `Tinebase_Frontend_Json_Abstract` als Fassade

### 6. **Data Mapper Pattern**
- Backend-Klassen mappen zwischen Objekten und Datenbank
- `Tinebase_Backend_Sql` konvertiert Records zu SQL

### 7. **Registry Pattern**
- `Tinebase_Core` als zentrales Registry
- `Tinebase_Core::get()` / `Tinebase_Core::set()`
- Speichert: Config, Logger, Cache, Session, User, DB

### 8. **Dependency Injection**
- Controller bekommen Backend via Constructor-Injection
- Ermöglicht Testing und Flexibilität

### 9. **Template Method Pattern**
- `Tinebase_Controller_Record_Abstract` definiert Template
- Subklassen überschreiben Hooks wie `_inspectBeforeCreate()`

### 10. **Chain of Responsibility**
- Server-Plugins verarbeiten Requests nacheinander
- `Tinebase_Server_Plugin/*` (Http, Json, WebDAV, etc.)

## Sicherheit & Features

### Access Control
- **Container-ACL**: Rechte auf Container-Ebene
- **Record-ACL**: Individuelle Record-Rechte
- **Role-Based Access Control (RBAC)**: Rollen und Rechte-System
- **Area Locks**: Sensitive Bereiche mit zusätzlichem Passwortschutz

### Weitere Features
- **ModLog (Modification Log)**: Vollständiges Audit-Trail aller Änderungen
- **Relations**: Verknüpfungen zwischen verschiedenen Record-Typen
- **Custom Fields**: Dynamische, konfigurierbare Felder
- **Tags & Notes**: Metadaten für Records
- **Attachments**: File-Attachments an Records
- **Full-Text Search**: Indexierung und Suche
- **Transactions**: Datenbank-Transaktionen via `Tinebase_TransactionManager`
- **Caching**: Multi-Level Cache (Memory, Redis)
- **Async Jobs**: Queue-System für zeitintensive Tasks

## Applikations-Struktur

Jede Tine20-Applikation folgt derselben Struktur:

```
ExampleApplication/
├── Controller/          # Business Logic
│   └── ExampleRecord.php
├── Frontend/            # API Interfaces
│   ├── Json.php
│   ├── Http.php
│   └── Cli.php
├── Backend/             # Data Access (optional, meist Tinebase verwendet)
├── Model/               # Domain Models
│   └── ExampleRecord.php
├── Setup/               # Installation & Updates
│   ├── Initialize.php
│   └── Update/
├── Config.php           # App-Konfiguration
├── Acl/                 # Access Control Definitionen
│   └── Rights.php
└── js/                  # Frontend (ExtJS)
    ├── Example.js
    ├── ExampleGridPanel.js
    └── ExampleRecordEditDialog.js
```

## Performance-Optimierungen

1. **Lazy Loading**: Relations und Custom Fields werden nur bei Bedarf geladen
2. **Batch Requests**: Mehrere JSON-RPC Calls in einem HTTP-Request
3. **Pagination**: Server-seitige Pagination mit `start`/`limit`
4. **Caching**: Multi-Level (Zend_Cache, Redis, APCu)
5. **Database Optimization**: Prepared Statements, Connection Pooling
6. **Async Processing**: Queue für lange Operationen (Exports, Imports)

## Zusammenfassung für Gespräch

**Kernaussagen:**

1. **Architektur**: Klassisches 5-Layer MVC mit Server → Frontend → Controller → Backend → Model
2. **Kommunikation**: JSON-RPC 2.0 über Ext.Direct für nahtlose JavaScript-PHP Integration
3. **Design Patterns**: Hauptsächlich Singleton (Controller), Observer (Events), Strategy (Backends), Facade (Frontend)
4. **Modell-System**: Konfigurationsbasiert mit automatischer CRUD-Generierung
5. **Sicherheit**: Multi-Level ACL mit Container, Record und Role-based Access Control
6. **Erweiterbarkeit**: Plugin-System, Event-Hooks, austauschbare Backends

**Vorteile der Architektur:**
- Klare Trennung der Verantwortlichkeiten (Separation of Concerns)
- Hohe Wiederverwendbarkeit durch abstrakte Basis-Klassen
- Konsistenz über alle Applikationen hinweg
- Einfache Erweiterbarkeit durch definierte Extension Points
- Testbarkeit durch Dependency Injection und Interfaces
