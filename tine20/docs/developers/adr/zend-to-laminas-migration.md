# Zend Framework 1 to Laminas Migration

## Status

Proposed

## Date

2026-02-21

## Deciders

TBD

## Context

The application currently depends on `zendframework/zendframework1` (version 1.12.20), which reached
end-of-life in 2016. Continuing to use an unmaintained library creates security and compatibility
risks, especially as PHP itself evolves (e.g. PHP 8.x deprecations and removals).

Laminas Project is the official successor to Zend Framework and provides drop-in replacements for
virtually every Zend Framework 1 and Zend Framework 2/3 component. The bridge package
`laminas/laminas-zendframework-bridge` (already installed) enables a phased migration by mapping the
old `Zend_*` class aliases to their Laminas equivalents, which means individual components can be
replaced incrementally without requiring a big-bang rewrite.

The following Zend Framework 1 component groups are currently in active use across the codebase:

| Component group | Key classes | Laminas replacement |
|---|---|---|
| **Authentication** | `Zend_Auth`, `Zend_Auth_Adapter_*`, `Zend_Auth_Result`, `Zend_Auth_Storage_*` | `laminas/laminas-authentication` |
| **Cache** | `Zend_Cache`, `Zend_Cache_Core`, `Zend_Cache_Backend_Redis`, `Zend_Cache_Frontend_File` | `laminas/laminas-cache` + `laminas/laminas-cache-storage-adapter-*` |
| **Configuration** | `Zend_Config`, `Zend_Config_Ini`, `Zend_Config_Xml`, `Zend_Config_Writer_Array` | `laminas/laminas-config` |
| **CLI** | `Zend_Console_Getopt` | Symfony Console (already used at root level) |
| **Currency** | `Zend_Currency` | PHP `intl` extension (`NumberFormatter`) |
| **Date/Time** | `Zend_Date`, `Zend_Locale`, `Zend_Locale_Format`, `Zend_Locale_Data` | PHP `DateTime`/`DateTimeImmutable`, `IntlDateFormatter` |
| **Database** | `Zend_Db`, `Zend_Db_Adapter_*`, `Zend_Db_Select`, `Zend_Db_Table_*`, `Zend_Db_Expr` | `laminas/laminas-db` |
| **Filtering** | `Zend_Filter`, `Zend_Filter_*`, `Zend_Filter_Input` | `laminas/laminas-filter` |
| **HTTP client** | `Zend_Http_Client`, `Zend_Http_Client_Adapter_*`, `Zend_Http_Response` | `laminas/laminas-http` (already installed) |
| **HTTP request** | `Zend_Controller_Request_Http` | PSR-7 via `laminas/laminas-diactoros` (already installed) |
| **JSON / JSON-RPC** | `Zend_Json`, `Zend_Json_Server`, `Zend_Json_Server_*`, `Zend_Server_*` | `laminas/laminas-json`, `laminas/laminas-json-server` |
| **LDAP** | `Zend_Ldap`, `Zend_Ldap_Dn`, `Zend_Ldap_Filter`, `Zend_Ldap_Exception` | `laminas/laminas-ldap` |
| **Logging** | `Zend_Log`, `Zend_Log_Writer_*`, `Zend_Log_Filter_*`, `Zend_Log_Formatter_*` | `laminas/laminas-log` or Monolog |
| **Mail / MIME** | `Zend_Mail`, `Zend_Mail_Protocol_*`, `Zend_Mail_Storage_*`, `Zend_Mime`, `Zend_Mime_Part` | `laminas/laminas-mail`, `laminas/laminas-mime` |
| **PDF** | `Zend_Pdf`, `Zend_Pdf_Page`, `Zend_Pdf_Font`, `Zend_Pdf_Image` | FPDF/TCPDF/mPDF or `laminas/laminas-pdf` (community fork) |
| **Redis proxy** | `Zend_RedisProxy` | `phpredis` extension directly or `predis/predis` |
| **Registry** | `Zend_Registry` | DI container (e.g. PSR-11) |
| **Session** | `Zend_Session`, `Zend_Session_Namespace`, `Zend_Session_SaveHandler_Interface`, `Zend_Session_Validator_*` | `laminas/laminas-session` |
| **Translation/i18n** | `Zend_Translate`, `Zend_Translate_Adapter`, `Zend_Locale` | `laminas/laminas-i18n` or `symfony/translation` |
| **Validation** | `Zend_Validate_*` | `laminas/laminas-validator` |
| **View/Templates** | `Zend_View` | Twig (already used in export/email templates) or `laminas/laminas-view` |

## Decision

Migrate all Zend Framework 1 components to their Laminas equivalents (or PHP-native / third-party
alternatives where more appropriate) in a phased approach:

1. **Phase 1 – Low-risk, self-contained components** (no cross-cutting dependencies):
   - `Zend_Console_Getopt` → Symfony Console
   - `Zend_Currency` / `Zend_Date` / `Zend_Locale` → PHP `intl` extension
   - `Zend_Filter` → `laminas/laminas-filter`
   - `Zend_Validate` → `laminas/laminas-validator`
   - `Zend_Config` → `laminas/laminas-config`
   - `Zend_Json` → native `json_encode`/`json_decode` + `laminas/laminas-json-server`

2. **Phase 2 – Infrastructure components** (more usage, but well-isolated):
   - `Zend_Log` → `laminas/laminas-log` or Monolog
   - `Zend_Cache` → `laminas/laminas-cache`
   - `Zend_Session` → `laminas/laminas-session`
   - `Zend_Http` → `laminas/laminas-http` (already installed)
   - `Zend_Registry` → PSR-11 DI container

3. **Phase 3 – Core application components** (highest impact, require careful regression testing):
   - `Zend_Db` → `laminas/laminas-db`
   - `Zend_Auth` → `laminas/laminas-authentication`
   - `Zend_Ldap` → `laminas/laminas-ldap`
   - `Zend_Mail` / `Zend_Mime` → `laminas/laminas-mail` / `laminas/laminas-mime`
   - `Zend_Translate` → `laminas/laminas-i18n`
   - `Zend_View` → Twig (already partially adopted)
   - `Zend_Json_Server` / `Zend_Server_*` → `laminas/laminas-json-server`
   - `Zend_Pdf` → mPDF or TCPDF

Key wrappers that encapsulate Zend dependencies and should be migrated first to minimise blast
radius: `Tinebase/Server/ZendJsonWrapper.php`, `Tinebase/Server/ZendSmdServiceWrapper.php`.

## Consequences

**Positive:**
- Eliminates dependency on unmaintained, EOL software
- Opens path to full PHP 8.x compatibility without relying on the ZF1 fork
- Improves security posture
- Laminas components have PHPStan-friendly type annotations, enabling PHPStan level to be raised

**Negative:**
- Large migration surface (~150+ files reference `Zend_*` classes)
- Zend Framework 1 and Laminas API are not always identical; some adapters need custom code
- Risk of regressions in core areas (authentication, database, session, mail)
- Requires extensive integration and regression testing per phase
