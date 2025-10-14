# Changelog

## [2.0.0] - 2025-10-13

### 🎉 Major Refactoring - Clean Architecture

Complete rewrite of the application following professional software architecture patterns.

### ✨ New Features

#### Multi-Server Support
- Monitor multiple servers simultaneously
- Configure via comma-separated `SERVERS` environment variable
- Each server maintains independent state and statistics

#### Advanced Notifications
- **Telegram**: Enhanced message formatting with HTML support
- **Webhooks**: Send notifications to custom HTTP endpoints
- **Composite Service**: Send to multiple channels simultaneously
- **Smart Detection**: Only notifies on actual changes

#### Statistics & Analytics
- Track uptime percentage per server
- Calculate queue statistics (average, min, max)
- Monitor transfer availability percentage
- View historical trends

#### History Storage
- Persistent history in JSON format
- Configurable retention (default: 1000 entries per server)
- Query historical data for analysis

#### Feature Flags
- `FEATURE_STATISTICS`: Enable/disable statistics tracking
- `FEATURE_HISTORY`: Enable/disable history storage
- `FEATURE_QUEUE_ALERTS`: Enable queue threshold notifications
- Easily toggle features without code changes

#### Enhanced Server Data
- Fresh Start World detection
- Return to Aeternum World detection
- Character creation availability
- Transfer from/to flags
- More accurate population levels

### 🏗️ Architecture Improvements

#### Layered Architecture
- **Domain Layer**: Pure business logic with types and interfaces
- **Application Layer**: Use cases implementing business workflows
- **Infrastructure Layer**: External service implementations
- **Configuration Layer**: Centralized config management

#### Design Patterns
- **Repository Pattern**: Abstract data persistence
- **Strategy Pattern**: Pluggable notification services
- **Dependency Injection**: All dependencies injected via constructors
- **Composite Pattern**: Multi-channel notifications
- **Factory Pattern**: Configuration service

#### Code Organization
```
src/
├── domain/              # Business entities and contracts
├── infrastructure/      # External implementations
│   ├── scraper/
│   ├── notifications/
│   └── storage/
├── application/         # Use cases
├── config/             # Configuration
└── index.ts            # Entry point
```

### 🔧 Technical Improvements

#### Reliability
- Better error handling with proper cleanup
- Retry logic with exponential backoff
- Browser lifecycle management improvements
- State persistence survives restarts

#### Performance
- Optimized browser initialization
- Reduced memory leaks
- Better resource cleanup

#### Maintainability
- Clear separation of concerns
- SOLID principles applied
- Comprehensive TypeScript types
- Self-documenting code structure

### 📚 Documentation

- **README.md**: Updated with new features and configuration
- **ARCHITECTURE.md**: Detailed architecture documentation
- **CHANGELOG.md**: Version history and changes
- Inline code documentation

### 🗑️ Removed

- Legacy `index.ts` (moved to `src/index.ts`)
- `test.ts` (to be replaced with proper test suite)
- Monolithic code structure

### 🔄 Migration Guide

#### From v1.x to v2.0

1. **Update environment variables**:
   ```env
   # Old
   SERVER_NAME=Nysa
   
   # New (supports multiple)
   SERVERS=Nysa,Valhalla,El Dorado
   ```

2. **Update start command**:
   ```bash
   # Old
   bun run index.ts
   
   # New
   bun start
   ```

3. **Data location**:
   - State files now in `data/` directory
   - Old `monitor-state.json` can be deleted

4. **New optional features**:
   - Add webhook URL for additional notifications
   - Enable queue alerts if needed
   - Configure feature flags

### 🐛 Bug Fixes

- Fixed "Protocol error: Connection closed" by proper browser lifecycle
- Fixed state not persisting between restarts
- Fixed duplicate notifications on restart
- Fixed memory leaks from unclosed browser instances

### ⚡ Performance

- Reduced browser startup time with optimized initialization
- Better resource cleanup prevents memory growth
- Efficient state serialization

### 🔐 Security

- No hardcoded credentials
- Environment-based configuration
- Webhook support for secure integrations

---

## [1.0.0] - 2025-10-12

### Initial Release

- Basic server monitoring for single server
- Telegram notifications
- Transfer status change detection
- Simple state persistence
