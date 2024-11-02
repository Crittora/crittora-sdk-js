import dotenv from "dotenv";

export interface CrittoraEnvironment {
  cognitoEndpoint: string;
  baseUrl: string;
  userPoolId: string;
  clientId: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private readonly config: CrittoraEnvironment;

  private constructor() {
    dotenv.config();

    this.config = {
      cognitoEndpoint: "https://cognito-idp.us-east-1.amazonaws.com/",
      baseUrl: "https://api.crittoraapis.com",
      userPoolId: "us-east-1_Tmljk4Uiw",
      clientId: "5cvaao4qgphfp38g433vi5e82u",
    };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): CrittoraEnvironment {
    return this.config;
  }
}
