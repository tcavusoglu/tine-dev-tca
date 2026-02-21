# Refactoring Overview

This document gives an overview of all areas of the codebase that are candidates for refactoring,
with particular emphasis on the migration away from Zend Framework 1.  It is intended as a starting
point for developers planning the modernisation effort.

---

## 1. Zend Framework 1 Components

Zend Framework 1 (`zendframework/zendframework1: 1.12.20`) is an EOL library last released in
2016.  Its successor is the **Laminas Project** (`laminas/*`), which already provides a bridge
package (`laminas/laminas-zendframework-bridge`) that is already installed and maps the old `Zend_`
class aliases to Laminas equivalents.

The complete list of Zend Framework 1 component groups actively used in the application, their key
classes, and recommended replacements is documented in the ADR:
[`adr/zend-to-laminas-migration.md`](adr/zend-to-laminas-migration.md)

### High-traffic wrappers to address first

| File | Purpose |
|---|---|
| `Tinebase/Server/ZendJsonWrapper.php` | Wraps `Zend_Json_Server` for the JSON-RPC endpoint |
| `Tinebase/Server/ZendSmdServiceWrapper.php` | Wraps `Zend_Json_Server_Smd_Service` |
| `Tinebase/Http/Server.php` | Uses `Zend_Json_Server_Request_Http` |
| `Tinebase/Core.php` | Central bootstrap: `Zend_Log`, `Zend_Cache`, `Zend_Db`, `Zend_Session`, `Zend_Locale` |
| `Tinebase/Session.php` / `Tinebase/Session/Abstract.php` | `Zend_Session_Namespace` |
| `Tinebase/Auth/Ldap.php` | `Zend_Ldap`, `Zend_Auth_Adapter_Ldap` |
| `Tinebase/Auth/Sql.php` / `Tinebase/Auth/Imap.php` | `Zend_Auth_Adapter_DbTable` / `Zend_Auth_Adapter_Imap` |
| `Tinebase/Backend/Sql/Adapter/Pdo/Mysql.php` | Extends `Zend_Db_Adapter_Pdo_Mysql` |
| `Setup/Backend/Mysql.php` / `Setup/Backend/Pgsql.php` / `Setup/Backend/Oracle.php` | Wrap `Zend_Db` for DDL operations |
| `Felamimail/Backend/ImapFactory.php` | Instantiates `Zend_Mail_Protocol_Imap` |

---

## 2. Autoloading: PSR-0 vs PSR-4

`tine20/composer.json` uses **PSR-0** autoloading for all application classes:

```json
"autoload": {
    "psr-0": {
        "": "tine20/"
    }
}
```

This loads everything under `tine20/` using the directory-as-namespace convention.  PSR-0 is
deprecated in favour of **PSR-4**.  Migrating requires:

- Renaming directories to use a top-level namespace (e.g. `Tine20\`)
- Updating all class declarations (`class Tinebase_Core` → `class Core` inside `namespace Tine20\Tinebase`)
- Replacing all bare `Tinebase_*` / `Zend_*` references with use-statements

This is a high-impact, long-running effort.  A recommended interim step is to introduce PSR-4 for
**new** classes and modules only, while keeping the PSR-0 map for legacy code until it is migrated.

---

## 3. Dual Model System

Two base record classes exist in parallel:

| Class | Location | Description |
|---|---|---|
| `Tinebase_Record_Abstract` | `Tinebase/Record/Abstract.php` | Original model base class |
| `Tinebase_Record_NewAbstract` | `Tinebase/Record/NewAbstract.php` | Newer model base class with improved field declaration |

New modules use `Tinebase_Record_NewAbstract`.  The goal should be to migrate all models to the new
base class and remove `Tinebase_Record_Abstract` once migration is complete.  This de-duplicates
logic around serialization, validation, and field access.

---

## 4. PHPStan Static Analysis

The current PHPStan configuration (`phpstan.neon`) runs at **level 2**, which is relatively
permissive.  Raising the level incrementally (e.g. 2 → 4 → 6) will surface type-safety issues and
help guide the Laminas migration (Laminas packages ship with type annotations).

Known excluded paths that should eventually be brought back into analysis:

```
tine20/Tinebase/User/Typo3.php
Setup/Backend/Oracle.php
Setup/Backend/Pgsql.php
```

The `phpstan-baseline.neon` file records currently accepted violations.  Any migration work should
aim to reduce—not grow—the baseline.

---

## 5. JavaScript Frontend (ExtJS 3)

The entire web UI is built with **ExtJS 3**, which has been EOL since ~2010.  Every application
module ships its own `js/` directory of ExtJS component files.

Key facts:
- Build tooling: Sencha `jsb2` descriptor files per module, webpack for newer code
- Test tooling: Karma (unit tests in `tests/js/karma/`) and Jest (in `tests/js/jest/`)
- Node dependencies: each module with modern JS has its own `package.json`

Recommended path: introduce **React** or **Vue** for new UI components alongside ExtJS, and
gradually replace screens module by module.  `CrewScheduling` already uses modern JS tooling and
can serve as a reference.

---

## 6. Vendored / Forked Third-Party Libraries

Libraries maintained as custom forks or vendored copies inside `tine20/library/`:

| Library | Notes |
|---|---|
| `tine20/library/qCal` | CalDAV/iCalendar parsing; consider replacing with `sabre/vobject` |
| `tine20/library/OpenDocument` | ODS/ODT generation; consider `PhpOffice/PhpSpreadsheet` |
| `tine20/library/PHPExcel` | Unmaintained; replace with `PhpOffice/PhpSpreadsheet` |
| `tine20/library/ExtJS` | Frontend library; part of the ExtJS migration effort |

Custom forks tracked as Composer VCS repositories:

| Dependency | Fork reason |
|---|---|
| `tine-groupware/zendframework1` | Bug-fixes and PHP 8.x compatibility patches |
| `tine-groupware/sabredav` | Custom extensions for CardDAV/CalDAV |
| `tine-groupware/syncroton` | ActiveSync server integration |
| `tine-groupware/Twig` | Custom Twig extensions |

Each fork should be evaluated when upgrading the corresponding component: ideally the patch should
be upstreamed or the fork dropped in favour of the official package.

---

## 7. Setup / Installation System

The Setup module (`tine20/Setup/`) handles schema creation and upgrades via hand-written XML
migration scripts.  There is no migration framework (e.g. Doctrine Migrations or Phinx) in use.

Areas for improvement:
- Oracle and PostgreSQL backends (`Setup/Backend/Oracle.php`, `Setup/Backend/Pgsql.php`) are
  excluded from static analysis
- Consider adopting a standard database migration library to replace the custom XML schema system

---

## 8. Multi-Database Support

The application supports MySQL, PostgreSQL, Oracle, and SQL Server.  Zend Framework 1 `Zend_Db`
adapters provide the database abstraction layer.  When migrating to `laminas/laminas-db`, ensure
all four adapters are covered.

PostgreSQL is partially tested; Oracle support is excluded from CI and static analysis.

---

## 9. Authentication Adapters

Authentication is handled through `Tinebase/Auth/` with these adapters:

| Adapter | Zend class | Notes |
|---|---|---|
| SQL/DB table | `Zend_Auth_Adapter_DbTable` | `Tinebase/Auth/Sql.php` |
| IMAP | `Zend_Auth_Adapter_Imap` | `Tinebase/Auth/Imap.php` |
| LDAP | `Zend_Auth_Adapter_Ldap` | `Tinebase/Auth/Ldap.php` |
| SSL certificate | `Zend_Auth_Adapter_ModSsl` | `Tinebase/Auth/ModSsl.php` |

When replacing `laminas/laminas-authentication`, each adapter must be reimplemented against the
Laminas `AdapterInterface`.

---

## 10. Logging

`Zend_Log` is used throughout the codebase via `Tinebase_Core::getLogger()`.  Writers in use:

| Writer class | Laminas / alternative |
|---|---|
| `Zend_Log_Writer_Syslog` | `laminas/laminas-log` `SyslogWriter` |
| `Zend_Log_Writer_Stream` | `laminas/laminas-log` `StreamWriter` |
| `Zend_Log_Writer_Db` | `laminas/laminas-log` `DbWriter` |
| `Zend_Log_Writer_Null` | `laminas/laminas-log` `NullWriter` |

Alternative: adopt **Monolog** (PSR-3 compliant) and update `Tinebase_Core::setupLogger()` and all
`isLogLevel()` / `getLogger()` call sites.

---

## 11. Caching

`Zend_Cache` is set up in `Tinebase_Core::setupCache()`.  Backends in use:

| Backend | Replacement |
|---|---|
| `Zend_Cache_Backend_Redis` (`Zend_RedisProxy`) | `laminas/laminas-cache-storage-adapter-redis` or `predis/predis` |
| File cache | `laminas/laminas-cache-storage-adapter-filesystem` |

---

## 12. HTTP / Request Handling

The application already partially uses PSR-7 / PSR-15 via:
- `laminas/laminas-diactoros` (PSR-7 message implementation)
- `laminas/laminas-stratigility` (PSR-15 middleware pipeline)
- `laminas/laminas-httphandlerrunner`

`Zend_Controller_Request_Http` is still referenced in places; these should be replaced with PSR-7
`ServerRequestInterface` from the already-installed `laminas-diactoros`.

---

## 13. Code Style and Quality

- **phpcs.baseline.xml** – tracked violations; aim to reduce on every PR
- **phpstan-baseline.neon** – accepted type errors; aim to reduce and raise level over time
- **Mixed `array` type hints** – many methods use untyped arrays; add specific array shapes or
  typed collections progressively
- **`@todo` / `@fixme` comments** – scattered throughout; periodically review and resolve

---

## Summary: Recommended Refactoring Priority

| Priority | Area | Effort | Risk |
|---|---|---|---|
| 🔴 Critical | Zend Framework 1 → Laminas (phase 1: filters, validation, config, JSON) | Medium | Low |
| 🔴 Critical | Zend Framework 1 → Laminas (phase 2: log, cache, session, HTTP) | Medium | Medium |
| 🔴 Critical | Zend Framework 1 → Laminas (phase 3: DB, auth, LDAP, mail, translate) | High | High |
| 🟠 High | Replace vendored `PHPExcel` with `PhpOffice/PhpSpreadsheet` | Low | Low |
| 🟠 High | Migrate dual model system to `Tinebase_Record_NewAbstract` | High | Medium |
| 🟡 Medium | Raise PHPStan level from 2 → 4 | Medium | Low |
| 🟡 Medium | PSR-4 autoloading for new modules | Low | Low |
| 🟡 Medium | Replace `Zend_Console_Getopt` with Symfony Console | Low | Low |
| 🟢 Low | Replace ExtJS 3 with modern JS framework (module by module) | Very High | High |
| 🟢 Low | Adopt database migration framework (Doctrine Migrations / Phinx) | High | Medium |
