import { after } from "next/server";
import { agentTestConfigService } from "@/backend/services/agent-test-config/service";
import { agentTestGenerationService } from "@/backend/services/agent-test-config/generation.service";
import { agentTestExecutionService } from "@/backend/services/agent-test-config/execution.service";
import { agentTestAqsService } from "@/backend/services/agent-test-config/aqs.service";
import { CustomRequest } from "@/backend/utils/interceptor";

export class AgentTestConfigController {
  async list(request: CustomRequest) {
    const configs = await agentTestConfigService.list(request.userInfo.id);
    return { data: configs };
  }

  async create(request: CustomRequest) {
    const body = await request.json();
    const config = await agentTestConfigService.create(
      body,
      request.userInfo.id,
    );
    return { data: config, statusCode: 201 };
  }

  async getById(request: CustomRequest, id: string) {
    const config = await agentTestConfigService.getById(
      id,
      request.userInfo.id,
    );
    return { data: config };
  }

  async update(request: CustomRequest, id: string) {
    const body = await request.json();
    const config = await agentTestConfigService.update(
      id,
      body,
      request.userInfo.id,
    );
    return { data: config };
  }

  async delete(request: CustomRequest, id: string) {
    await agentTestConfigService.delete(id, request.userInfo.id);
    return { message: "Agent test configuration deleted successfully" };
  }

  async generateTests(request: CustomRequest, id: string) {
    const testCases = await agentTestGenerationService.generateForConfig(
      id,
      request.userInfo.id,
    );
    return { data: testCases, statusCode: 201 };
  }

  async getTestCases(request: CustomRequest, id: string) {
    const testCases = await agentTestGenerationService.getTestCases(
      id,
      request.userInfo.id,
    );
    return { data: testCases };
  }

  async startRun(request: CustomRequest, id: string) {
    const { summary, executionPromise } =
      await agentTestExecutionService.prepareRun(id, request.userInfo.id);
    // Register the execution promise with Next.js so it survives after the
    // response is sent. Without this, Next.js cancels the background work.
    after(executionPromise);
    return { data: summary, statusCode: 202 };
  }

  async getRun(request: CustomRequest, runId: string) {
    const run = await agentTestExecutionService.getRun(
      runId,
      request.userInfo.id,
    );
    return { data: run };
  }

  async listRuns(request: CustomRequest, id: string) {
    const runs = await agentTestExecutionService.listRuns(
      id,
      request.userInfo.id,
    );
    return { data: runs };
  }

  async rescoreResult(request: CustomRequest, resultId: string) {
    await agentTestExecutionService.rescoreResult(
      resultId,
      request.userInfo.id,
    );
    return { message: "Re-score completed successfully" };
  }

  async getAqs(request: CustomRequest, runId: string) {
    const aqs = await agentTestAqsService.getForRun(runId, request.userInfo.id);
    return { data: aqs };
  }

  async computeAqs(request: CustomRequest, runId: string) {
    const aqs = await agentTestAqsService.computeAndPersist(
      runId,
      request.userInfo.id,
    );
    return { data: aqs };
  }
}

export const agentTestConfigController = new AgentTestConfigController();
