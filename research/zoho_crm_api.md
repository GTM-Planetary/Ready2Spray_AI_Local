# Zoho CRM API Research

## Authentication: OAuth 2.0

Zoho CRM uses OAuth 2.0 for authentication. Key points:

- **Access Token**: Valid for 1 hour, used to access protected resources
- **Refresh Token**: Unlimited lifetime (until revoked), used to obtain new access tokens
- **Client ID & Secret**: Generated from connected application registration

### OAuth Flow Steps:
1. Register a Client (get Client ID and Secret)
2. Make Authorization Request (user grants permission)
3. Generate Tokens (exchange auth code for access/refresh tokens)
4. Refresh Access Tokens (when expired)
5. Revoke Tokens (when needed)

### Key Endpoints:
- Authorization: `https://accounts.zoho.com/oauth/v2/auth`
- Token Generation: `https://accounts.zoho.com/oauth/v2/token`
- Token Refresh: `https://accounts.zoho.com/oauth/v2/token`

## API Structure

### Core APIs
Perform CRUD operations on CRM module entities:
- Contacts
- Accounts
- Deals
- Leads
- Tasks
- etc.

### Notification APIs (Webhooks)
Get notified whenever data changes occur inside CRM.

### Bulk APIs
Push and retrieve data in bulk using asynchronous APIs.

### Query APIs
Fetch records using SELECT query (SQL syntax) from Zoho CRM.

## Data Mapping for Ready2Spray Integration

### Zoho CRM → Ready2Spray
- **Contacts** → Customers
- **Accounts** → Customers (company-level)
- **Deals** → Jobs
- **Tasks** → Jobs (service tasks)

### Ready2Spray → Zoho CRM
- **Customers** → Contacts/Accounts
- **Jobs** → Deals/Tasks
- **Personnel** → Users (read-only, for assignment)

## Integration Strategy

1. **OAuth Setup**: Implement OAuth 2.0 flow for user authorization
2. **Bidirectional Sync**: 
   - Ready2Spray creates/updates → Push to Zoho CRM
   - Zoho CRM creates/updates → Webhook triggers sync to Ready2Spray
3. **Conflict Resolution**: Use timestamps to determine which record is newer
4. **Field Mapping**: Store mapping configuration in database
5. **Sync Logs**: Track all sync operations for debugging

## Next Steps
- Research FieldPulse API
- Design integration database schema
- Implement OAuth flow
- Build sync procedures
