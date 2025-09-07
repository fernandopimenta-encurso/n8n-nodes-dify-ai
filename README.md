# n8n-nodes-dify-ai

A comprehensive n8n community node for Dify.ai integration, providing advanced AI workflow automation capabilities.

## Features

This package provides a complete Dify.ai integration with the following capabilities:

### Chat Operations
- **Send Message**: Send chat messages to Dify AI with support for:
  - Blocking and streaming response modes
  - Conversation continuity via conversation IDs
  - File attachments (images, documents, audio, video)
  - Custom input variables
  - User identification for analytics
- **Stop Generation**: Stop ongoing chat message generation
- **Get Suggested Questions**: Retrieve AI-generated follow-up questions for conversations

### Text Completion Operations
- **Create Completion**: Generate text completions with:
  - Custom input variables (required)
  - File attachment support
  - Blocking and streaming modes
  - User identification
- **Stop Generation**: Stop ongoing completion generation

### Feedback Operations
- **Submit Feedback**: Provide feedback on AI responses with:
  - Like/dislike ratings
  - Optional detailed feedback content
  - User identification

## Installation

### Prerequisites
- n8n version 1.0.0 or higher
- Node.js 20.15 or higher

### Via npm
```bash
npm install n8n-nodes-dify-ai
```

### Manual Installation
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript
4. Copy the compiled files to your n8n custom nodes directory

## Configuration

### Credentials
You'll need to set up Dify API credentials:

1. **Base URL**: Your Dify instance URL (e.g., `https://api.dify.ai/v1` for Dify Cloud)
2. **API Key**: Your Dify application API key (format: `app-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Getting API Key
1. Log into your Dify dashboard
2. Navigate to your application settings
3. Go to "API Access" section
4. Copy the API key

## Usage Examples

### Basic Chat Message
```json
{
  "resource": "chat",
  "operation": "send",
  "query": "What is the weather like today?",
  "responseMode": "blocking",
  "user": "user123"
}
```

### Chat with File Attachment
```json
{
  "resource": "chat",
  "operation": "send",
  "query": "Can you analyze this document?",
  "files": [
    {
      "inputDataFieldName": "document",
      "type": "document"
    }
  ]
}
```

### Streaming Chat Response
```json
{
  "resource": "chat",
  "operation": "send",
  "query": "Tell me a story",
  "responseMode": "streaming"
}
```

### Text Completion
```json
{
  "resource": "completion",
  "operation": "create",
  "inputs": [
    {
      "key": "topic",
      "value": "artificial intelligence"
    }
  ]
}
```

### Submit Feedback
```json
{
  "resource": "feedback",
  "operation": "submit",
  "messageId": "msg-12345678-1234-5678-9012-123456789012",
  "rating": "like",
  "content": "Great response, very helpful!"
}
```

## Advanced Features

### Streaming Support
The node supports Server-Sent Events (SSE) streaming for real-time AI responses. When using streaming mode, you'll receive multiple output items:
- Individual chunks as they arrive
- A final item marked with `"final": true` containing complete response and metadata

### File Handling
Supports multiple file types:
- **Images**: PNG, JPG, GIF, etc.
- **Documents**: PDF, TXT, DOC, etc.
- **Audio**: MP3, WAV, M4A, etc.
- **Video**: MP4, AVI, MOV, etc.

Files are automatically uploaded to Dify before being attached to messages.

### Error Handling
- Comprehensive error handling with user-friendly error messages
- Retry logic with exponential backoff for transient failures
- Input validation and sanitization
- Rate limiting protection

### Additional Options
- **Timeout**: Configure request timeout (1-300 seconds)
- **Include Usage Stats**: Option to include token usage and cost information
- **Include Retriever Resources**: Option to include knowledge base retrieval information

## Node Structure

The implementation follows n8n best practices and includes:

### Files Structure
```
nodes/Dify/
├── Dify.node.ts              # Main node implementation
├── DifyOperations.ts          # Operation implementations
├── descriptions/              # Parameter descriptions
│   ├── ChatDescription.ts     # Chat operation parameters
│   ├── CompletionDescription.ts # Completion parameters
│   ├── FeedbackDescription.ts   # Feedback parameters
│   └── shared.ts             # Common parameters
└── dify.svg                  # Node icon

credentials/
├── DifyApi.credentials.ts    # Credential definition
└── Dify.svg                  # Credential icon

utils/
├── GenericFunctions.ts       # API utilities and helpers
└── types.ts                  # TypeScript type definitions
```

### Key Features
- **Type Safety**: Full TypeScript implementation with strict typing
- **Modular Design**: Separated concerns for maintainability
- **Error Handling**: Comprehensive error handling and validation
- **Performance**: Optimized API requests with retry logic
- **Standards Compliance**: Follows n8n community node standards

## Supported Dify API Endpoints

This initial version covers core functionality:

### Chat Messages (/chat-messages)
- POST: Send chat messages
- POST: Stop chat generation

### Completion Messages (/completion-messages)
- POST: Create text completions  
- POST: Stop completion generation

### Message Management (/messages)
- GET: Get suggested questions
- POST: Submit message feedback

### File Management (/files)
- POST: Upload files for attachments

## Development

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
npm run lintfix  # Auto-fix issues
```

### Development Mode
```bash
npm run dev  # Watch for changes
```

## Contributing

Contributions are welcome! Please:

1. Follow n8n community node standards
2. Add TypeScript types for new features
3. Include comprehensive error handling
4. Add tests for new functionality
5. Update documentation

## Future Roadmap

Based on the comprehensive plan in `n8nDifyPlan.md`, future versions will include:

- **DifyWorkflow**: Workflow execution and management
- **DifyKnowledgeBase**: Complete knowledge base operations
- **DifyConversation**: Conversation management
- **DifyFile**: Enhanced file operations  
- **DifyTTS**: Text-to-speech and speech-to-text
- **DifyApplication**: Application information and settings
- **DifyAnnotation**: Annotation system support
- **DifyTrigger**: Webhook trigger node

## License

MIT License - see LICENSE.md for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Changelog

### v0.1.0
- Initial release with core functionality
- Chat operations (send, stop, get suggestions)
- Text completion operations (create, stop)
- Feedback operations (submit)
- File upload support
- Streaming response support
- Comprehensive error handling
- Full TypeScript implementation