# Architecture Documentation

## Overview

This project follows a **Layered Architecture** pattern with clear separation of concerns:

```
src/
├── domain/              # Business logic and contracts
│   ├── types.ts        # Core domain types and enums
│   └── interfaces.ts   # Interface contracts
├── infrastructure/      # External implementations
│   ├── scraper/        # Web scraping implementations
│   ├── notifications/  # Notification service implementations
│   └── storage/        # Data persistence implementations
├── application/         # Use cases (business workflows)
│   └── use-cases/
├── config/             # Configuration management
└── index.ts            # Application entry point
```

## Design Patterns

### 1. **Layered Architecture**
- **Domain Layer**: Pure business logic, no dependencies
- **Application Layer**: Use cases orchestrating domain logic
- **Infrastructure Layer**: External concerns (DB, APIs, scraping)
- **Configuration Layer**: Environment and settings management

### 2. **Repository Pattern**
- `IStateRepository`: Manages application state persistence
- `IHistoryRepository`: Manages historical data storage
- Implementations: `JsonStateRepository`, `JsonHistoryRepository`

### 3. **Strategy Pattern**
- `INotificationService`: Abstract notification interface
- Implementations: `TelegramNotificationService`, `WebhookNotificationService`
- `CompositeNotificationService`: Sends to multiple channels

### 4. **Dependency Injection**
- All dependencies injected through constructors
- Easy to test and swap implementations
- Clear dependency graph

### 5. **Factory Pattern**
- `ConfigService`: Creates configuration from environment
- Centralized object creation logic

## Key Components

### Domain Layer

**Types (`types.ts`)**
- `ServerStatus`: Complete server information
- `ServerStatistics`: Aggregated metrics
- `MonitorState`: Application state
- `NotificationPayload`: Notification data structure

**Interfaces (`interfaces.ts`)**
- `IServerScraper`: Contract for data fetching
- `INotificationService`: Contract for notifications
- `IStateRepository`: Contract for state persistence
- `IHistoryRepository`: Contract for history storage
- `IConfigService`: Contract for configuration

### Infrastructure Layer

**Scraper**
- `NWDBScraper`: Puppeteer-based scraper for nwdb.info
- Handles retries, browser lifecycle, data extraction

**Notifications**
- `TelegramNotificationService`: Telegram Bot API integration
- `WebhookNotificationService`: Generic webhook support
- `CompositeNotificationService`: Multi-channel notifications

**Storage**
- `JsonStateRepository`: JSON file-based state storage
- `JsonHistoryRepository`: JSON file-based history with statistics

### Application Layer

**Use Cases**
- `MonitorServerUseCase`: Core monitoring logic
  - Fetches server status
  - Detects changes
  - Sends notifications
  - Updates state and history
  
- `GetStatisticsUseCase`: Statistics retrieval and display
  - Calculates metrics
  - Formats output

### Configuration Layer

**ConfigService**
- Loads environment variables
- Provides typed configuration access
- Feature flags management

## Data Flow

```
User Request
    ↓
Application (index.ts)
    ↓
Use Case (MonitorServerUseCase)
    ↓
├─→ Scraper (fetch data)
├─→ Notification Service (send alerts)
├─→ State Repository (save state)
└─→ History Repository (save history)
```

## Benefits of This Architecture

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear separation makes changes easier
3. **Scalability**: Easy to add new features or implementations
4. **Flexibility**: Swap implementations without changing business logic
5. **Reusability**: Domain logic independent of infrastructure

## Adding New Features

### New Notification Channel
1. Create class implementing `INotificationService`
2. Add to `CompositeNotificationService` in `index.ts`

### New Data Source
1. Create class implementing `IServerScraper`
2. Inject into `MonitorServerUseCase`

### New Storage Backend
1. Create class implementing `IStateRepository` or `IHistoryRepository`
2. Inject into application

### New Use Case
1. Create class in `application/use-cases/`
2. Inject dependencies
3. Call from `index.ts`

## Testing Strategy

- **Unit Tests**: Test each class in isolation with mocks
- **Integration Tests**: Test layer interactions
- **E2E Tests**: Test complete workflows

## Future Improvements

- Add database support (PostgreSQL, MongoDB)
- Implement caching layer
- Add API server for web dashboard
- Implement event sourcing for history
- Add metrics and observability
