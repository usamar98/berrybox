export type DeploymentStatus = "queued" | "building" | "ready" | "failed";

export type Deployment = {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  url?: string;
};

export interface DeploymentProvider {
  publishGame(projectId: string): Promise<Deployment>;
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
}
