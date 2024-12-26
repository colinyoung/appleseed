# Appleseed Project

This project provides an API and testing suite for managing and interacting with tree planting data and service requests. It uses Playwright for automated testing and provides an OpenAPI specification that can be used to create custom GPTs.

## Project Structure

- `tests/` - Directory containing test files
- `playwright.config.ts` - Playwright configuration file
- `srNumbers.csv` - Data file containing Service Request (SR) numbers
- `trees-to-plant.csv` - Data file containing tree planting information
- `openapi.yaml` - OpenAPI specification for the API

## Getting Started

### Prerequisites

- Node.js
- pnpm (Preferred package manager)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

### Running Tests

To run the tests, use:

```bash
pnpm exec playwright test
```

## API Usage

The API provides endpoints for managing tree planting data and service requests. Here are some key endpoints:

### Service Requests
```typescript
// Get SR details
GET /api/sr/{srNumber}

// Update SR status
PUT /api/sr/{srNumber}/status
```

### Tree Planting
```typescript
// Get tree planting locations
GET /api/trees/locations

// Submit new tree planting request
POST /api/trees/plant
```

For detailed API documentation, refer to the OpenAPI specification in `openapi.yaml`.

## Creating a Custom GPT

You can create a custom GPT using this project's OpenAPI specification to interact with the tree planting service. Here's how:

1. Access the OpenAPI specification at `openapi.yaml`
2. Create a new GPT in ChatGPT
3. In the GPT's configuration:
   - Upload the OpenAPI specification
   - Configure authentication (if required)
   - Set appropriate action permissions

Example GPT prompts:
```plaintext
"Plant a new tree at coordinates 37.7749° N, 122.4194° W"
"Check the status of SR number 12345"
"List all pending tree planting requests"
```

## Configuration

### Playwright Configuration
The project uses `playwright.config.ts` for test configuration. See the [Playwright documentation](https://playwright.dev/docs/test-configuration) for more details on configuration options.

### API Configuration
Environment variables required for API configuration:
```bash
API_KEY=your_api_key
API_URL=https://api.example.com
```