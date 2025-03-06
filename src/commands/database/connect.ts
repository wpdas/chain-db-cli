import chalk from "chalk";
import ora from "ora";
import { apiRequest, saveToken, getApiUrl } from "../../utils/api";
import fetch from "node-fetch";
import packageJson from "../../../package.json";
interface ConnectDatabaseOptions {
  name: string;
  user: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: string;
}

// Função para verificar se o servidor está acessível
async function checkServerConnectivity(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "GET",
      timeout: 10000, // 10 segundos
      headers: {
        "User-Agent": `ChainDB-CLI/${packageJson.version}`,
      },
    });
    return response.status >= 200 && response.status < 500;
  } catch (error) {
    return false;
  }
}

export async function connectDatabase(
  options: ConnectDatabaseOptions
): Promise<void> {
  const spinner = ora("Connecting to database...").start();

  try {
    // Verificar se o servidor está acessível
    const baseUrl = getApiUrl("").replace("/api/v1/", "");
    const isServerAccessible = await checkServerConnectivity(baseUrl);

    if (!isServerAccessible) {
      spinner.fail(
        chalk.red(
          `Could not connect to server at ${baseUrl}. Please check if the server is running and the host is correct.`
        )
      );
      process.exit(1);
      return;
    }

    const response = await apiRequest<ApiResponse>(
      "POST",
      "database/connect",
      {
        name: options.name,
        user: options.user,
        password: options.password,
      },
      false // No authentication required
    );

    if (response.success && response.data) {
      // Save token for future use
      saveToken(response.data, options.name);
      spinner.succeed(
        chalk.green(`Connected to database '${options.name}' successfully!`)
      );
      process.exit(0);
    } else {
      spinner.fail(
        chalk.red(`Failed to connect: ${response.message || "Unknown error"}`)
      );
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Connection error: ${error.message}`));
    process.exit(1);
  }
}
