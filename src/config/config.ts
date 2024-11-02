import dotenv from "dotenv";

export interface CrittoraEnvironment {
  cognitoEndpoint: string;
  baseUrl: string;
  userPoolId: string;
  clientId: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private readonly config: Record<string, CrittoraEnvironment>;

  private constructor() {
    dotenv.config();

    this.config = {
      production: {
        cognitoEndpoint: "https://cognito-idp.us-east-1.amazonaws.com/",
        baseUrl: "https://api.crittoraapis.com",
        userPoolId: "us-east-1_Tmljk4Uiw",
        clientId: "5cvaao4qgphfp38g433vi5e82u",
      },
      development: {
        cognitoEndpoint: "https://cognito-idp.us-east-1.amazonaws.com/",
        baseUrl: "https://dev-api.crittoraapi.com",
        userPoolId: "us-east-1_Zl27AI2Vr",
        clientId: "5ok4074j0itrc27gbihn5s2bgn",
      },
    };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(
    environment: string = process.env.NODE_ENV || "development"
  ): CrittoraEnvironment {
    if (
      process.env.npm_lifecycle_event?.includes("publish") ||
      process.env.npm_lifecycle_event?.includes("build")
    ) {
      return this.config.production;
    }
    return this.config[environment] || this.config.development;
  }
}
