/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActionItemStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: ActionItemStatus;
  meetingId: string;
  projectId: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  projectId: string;
  participants: string[];
  decisions: string[];
  actionItems: ActionItem[];
  transcript?: string;
  summary?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface AnalysisResponse {
  participants: string[];
  decisions: string[];
  actionItems: {
    task: string;
    assignee: string;
    dueDate: string;
  }[];
  summary: string;
}
