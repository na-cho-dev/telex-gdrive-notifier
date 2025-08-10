import { Request } from "express";

export interface TelexWebhookRequest extends Request {
  body: {
    channel_id: string;
    return_url: string;
    settings: Array<{
      label: string;
      type?: string;
      required?: boolean;
      default: string;
    }>;
  };
}

export interface FileChangeData {
  event_name: string;
  message: string;
  status: "success" | "error" | "warning";
  username: string;
}

export interface DriveConfig {
  baseURL: string;
  folderId: string;
}

export interface WatchResponse {
  id: string;
  resourceId: string;
  expiration: string;
}

export interface JsonIntegrationData {
  data: {
    date: {
      created_at: string;
      updated_at: string;
    };
    descriptions: {
      app_description: string;
      app_logo: string;
      app_name: string;
      app_url: string;
      background_color: string;
    };
    integration_category: string;
    integration_type: string;
    is_active: boolean;
    key_features: string[];
    permissions: {
      monitoring_user: {
        always_online: boolean;
        display_name: string;
      };
    };
    settings: Array<{
      label: string;
      type: string;
      required: boolean;
      default: string;
    }>;
    tick_url: string;
    target_url: string;
  };
}
