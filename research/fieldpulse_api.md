# FieldPulse API Research

## Authentication: API Key

FieldPulse uses simple API key authentication:
- **API Key**: Must be requested from FieldPulse support (support@fieldpulse.com or chat)
- **Header**: Include API key in request header as `x-api-key`
- **No OAuth**: Unlike Zoho CRM, FieldPulse uses static API keys

## API Structure

### Base URL
`https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage`

### HTTP Methods
- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update resources
- **DELETE**: Delete resources

### Response Format
All responses in JSON format

### Rate Limits
- **50 requests per second**
- 429 status code when exceeded
- `RateLimit-Reset` header shows when limit resets (epoch format)

### Status Codes
- 200 OK: Success
- 201 Created: Resource created
- 202 Accepted: Authentication passed
- 400 Bad Request: Missing/wrong parameters
- 401 Unauthorized: Invalid authentication
- 404 Not Found: Resource doesn't exist
- 422 Unprocessable Entity: Validation error
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

## Available Endpoints

### Core Entities (Full CRUD)
- **Customers**: Create, update, delete, retrieve
- **Jobs**: Create, update, delete, retrieve
- **Invoices**: Create, update, delete, retrieve
- **Estimates**: Create, update, delete, retrieve
- **Locations**: Create, update, delete, retrieve
- **Users**: Retrieve only
- **Teams**: Retrieve only
- **Tags**: Create, update, delete, retrieve
- **Comments**: Create, update, delete, retrieve
- **Custom Fields**: Create, update, delete, retrieve
- **Subtasks**: Create, update, delete, retrieve
- **Projects**: Create, update, delete, retrieve
- **Purchase Orders**: Create, update, delete, retrieve
- **Payments**: Create, update, delete, retrieve
- **Timesheets**: Create, update, delete, retrieve
- **Assets**: Create, update, delete, retrieve
- **Material Lists**: Create, update, delete, retrieve

### Read-Only Entities
- **Contracts**: Retrieve only
- **Lead Source**: Retrieve only
- **Pipeline Status**: Retrieve only
- **Vendors**: Retrieve only
- **Invoice Items**: Create, retrieve (no update/delete)

### Webhooks
- **Job Status Changes**: Only webhook available currently
- No webhooks for customers, invoices, etc. (must poll)

## Data Mapping for Ready2Spray Integration

### FieldPulse → Ready2Spray
- **Customers** → Customers
- **Jobs** → Jobs
- **Users** → Personnel (read-only)
- **Locations** → Sites (customer addresses)
- **Teams** → Personnel groups

### Ready2Spray → FieldPulse
- **Customers** → Customers
- **Jobs** → Jobs
- **Sites** → Locations (on customer records)
- **Personnel** → Users (read-only, for assignment)

## Integration Strategy

1. **API Key Setup**: Request API key from FieldPulse support
2. **Polling-Based Sync**: 
   - No webhooks for customers/invoices
   - Poll every 5-15 minutes for changes
   - Track last sync timestamp
3. **Job Status Webhook**: Use webhook for real-time job status updates
4. **Rate Limit Handling**: Implement exponential backoff for 429 errors
5. **Field Mapping**: Store mapping configuration in database
6. **Sync Logs**: Track all sync operations for debugging

## Key Differences from Zoho CRM

| Feature | Zoho CRM | FieldPulse |
|---------|----------|------------|
| Authentication | OAuth 2.0 | API Key |
| Webhooks | Full support | Job status only |
| Rate Limits | Per day | 50/second |
| Token Refresh | Required | Not needed |
| User Consent | Required | Not required |

## Next Steps
- Design unified integration database schema
- Implement API key storage and management
- Build sync procedures for both platforms
- Create webhook handlers
- Implement conflict resolution logic
