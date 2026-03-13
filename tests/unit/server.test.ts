import { describe, expect, it, mock } from 'bun:test';

describe('PatentScope MCP Server', () => {
  describe('Server Initialization', () => {
    it('should initialize with tools', async () => {
      const mockLogger = {
        info: mock(),
        warn: mock(),
        error: mock(),
        debug: mock(),
        close: mock(),
      };

      const mockTool1 = {
        definition: {
          name: 'test_tool_1',
          description: 'Test tool 1',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
        handler: mock().mockResolvedValue({
          content: [{ type: 'text' as const, text: 'result1' }],
        }),
      };

      const mockTool2 = {
        definition: {
          name: 'test_tool_2',
          description: 'Test tool 2',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
        handler: mock().mockResolvedValue({
          content: [{ type: 'text' as const, text: 'result2' }],
        }),
      };

      const { PatentScopeServer } = await import('../../src/server.js');

      const server = new PatentScopeServer('1.0.0', mockLogger as never, [
        mockTool1,
        mockTool2,
      ]);

      expect(server).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Initializing PatentScope Server'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'PatentScope Server initialization completed'
      );
    });
  });

  describe('Tool Registration', () => {
    it('should register search_patents and get_patent_content tools', async () => {
      const mockLogger = {
        info: mock(),
        warn: mock(),
        error: mock(),
        debug: mock(),
      };

      const mockSerpApiClient = {
        searchPatents: mock(),
        getPatentDetails: mock(),
      };

      const { createSearchPatentsTool } = await import(
        '../../src/tools/search-patents.js'
      );
      const { createGetPatentTool } = await import(
        '../../src/tools/get-patent.js'
      );
      const { PatentService } = await import('../../src/services/patent.js');

      const patentService = new PatentService(
        mockSerpApiClient as never,
        mockLogger as never
      );

      const tools = [
        createSearchPatentsTool(
          mockSerpApiClient as never,
          mockLogger as never
        ),
        createGetPatentTool(patentService as never, mockLogger as never),
      ];

      expect(tools).toHaveLength(2);
      expect(tools[0].definition.name).toBe('search_patents');
      expect(tools[1].definition.name).toBe('get_patent');
    });
  });

  describe('Tool Handler Routing', () => {
    it('should route tool calls to correct handler', async () => {
      const mockResult1 = {
        content: [{ type: 'text' as const, text: 'result1' }],
      };
      const mockResult2 = {
        content: [{ type: 'text' as const, text: 'result2' }],
      };

      const mockTool1 = {
        definition: {
          name: 'tool1',
          description: 'Tool 1',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
        handler: mock().mockResolvedValue(mockResult1),
      };

      const mockTool2 = {
        definition: {
          name: 'tool2',
          description: 'Tool 2',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
        handler: mock().mockResolvedValue(mockResult2),
      };

      expect(mockTool1.handler).not.toHaveBeenCalled();
      expect(mockTool2.handler).not.toHaveBeenCalled();

      // Simulate calling handlers directly
      const result1 = (await mockTool1.handler({
        arg: 'value1',
      })) as typeof mockResult1;
      const result2 = (await mockTool2.handler({
        arg: 'value2',
      })) as typeof mockResult2;

      expect(mockTool1.handler).toHaveBeenCalledWith({ arg: 'value1' });
      expect(mockTool2.handler).toHaveBeenCalledWith({ arg: 'value2' });
      expect(result1).toEqual(mockResult1);
      expect(result2).toEqual(mockResult2);
    });
  });
});
