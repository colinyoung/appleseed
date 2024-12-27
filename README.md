# Appleseed Project

This project provides an API, Playwright script, and testing suite for submitting tree planting requests to the City of Chicago.

## Project Structure

- `tests/` - Directory containing test files
- `playwright.config.ts` - Playwright configuration file
- `srNumbers.csv` - Data file containing old Service Request (SR) numbers which can be imported
- `openapi.yaml` - OpenAPI specification for the API

## Getting Started

### Prerequisites

- Node.js
- pnpm (Preferred package manager)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
corepack enable
corepack prepare pnpm --activate
pnpm install
```

### Running Tests

To run the tests, use:

```bash
pnpm test
```

## API Usage

The API provides endpoints for managing tree planting data and service requests. Here are some key endpoints:

### Service Requests

```typescript
// Request a tree planting
POST /tree-requests;

{
  "address": "1234 W Main St",
  "numTrees": 1,
  "location": "Parkway"
}
```

For detailed API documentation, refer to the OpenAPI specification in `docs/openapi.yaml`.

## Creating a Custom GPT

You can create a custom GPT using this project's OpenAPI specification to interact with the tree planting service. Here's how:

1. Access the OpenAPI specification at `docs/openapi.yaml`
2. Create a new GPT in ChatGPT
3. In the GPT's configuration:
   - Upload the OpenAPI specification
   - Configure authentication
   - Set appropriate action permissions

Example GPT prompts:

```plaintext
"Plant a new tree at 1234 W Main St"
```

This is an example system prompt for your Custom GPT:

```plaintext
This GPT should not do much other than create tree requests using a /plant-tree API.

It should invoke a function call with appropriate parameters when a user gives it enough information to make a tree request - address, numTrees, and location. It doesn't need to always send numTrees or location, as they'll be filled in on the server. Addresses should be formatted as "1234 W Main St". Do not include the city,state, or zipcode in the address. Make sure the direction (N/S/E/W) is included as a single letter and street type (St/Ave/Rd/Ct/Pkwy/Expwy/Hwy/Cir/Ter/Blvd/Way/Sq) is included as the abbreviated form.

The system should tell the user whether a service request was created and, if the user mentions they want to know the service request number, it should also return that.

It should not talk to the user about physical trees, how to plant them, or other physical constraints as this is exclusively a system to create requests.
```

## Configuration

### Playwright Configuration

The project uses `playwright.config.ts` for test configuration. See the [Playwright documentation](https://playwright.dev/docs/test-configuration) for more details on configuration options.
