// backend/mcp-server.js

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// MCP сървър
const server = new McpServer({
  name: "ai-tools",
  version: "1.0.0"
});

// Примерен инструмент
server.tool(
  "list_ai_tools",
  {},
  async () => ({
    content: [
      { type: "text", text: "Claude API Connector" },
      { type: "text", text: "OpenAI Assistant SDK" },
      { type: "text", text: "LangChain Agent Hub" },
      { type: "text", text: "Vector Store Analyzer" }
    ]
  })
);

// STDIO транспорт (работи в Claude Desktop / MCP CLI)
const transport = new StdioServerTransport();

await server.connect(transport);

console.log("🧩 MCP server (STDIO) started — ready for Claude connection.");
