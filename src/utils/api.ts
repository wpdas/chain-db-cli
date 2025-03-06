import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { loadConfig } from "../commands/config";
import packageJson from "../../package.json";
// File to store the authentication token
const TOKEN_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  ".chaindb-token.json"
);

// Interface for the token
interface TokenData {
  token: string;
  database: string;
}

// Function to save the token
export function saveToken(token: string, database: string): void {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, database }, null, 2));
  } catch (error) {
    console.error("Error saving authentication token.");
    throw error;
  }
}

// Function to load the token
export function loadToken(): TokenData | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
    }
  } catch (error) {
    console.error("Warning: Could not load authentication token.");
  }

  return null;
}

// Function to create the API URL
export function getApiUrl(endpoint: string): string {
  const { host } = loadConfig();
  return `${host}/api/v1/${endpoint}`;
}

// Function to make API requests
export async function apiRequest<T>(
  method: string,
  endpoint: string,
  data?: any,
  useAuth: boolean = true
): Promise<T> {
  const url = getApiUrl(endpoint);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": `ChainDB-CLI/${packageJson.version}`,
  };

  // Add authentication token if needed
  if (useAuth) {
    const tokenData = loadToken();
    if (!tokenData) {
      throw new Error(
        'You are not authenticated. Use the "chaindb db connect" command to connect.'
      );
    }

    headers["Authorization"] = `Basic ${tokenData.token}`;
  }

  try {
    // Configurar opções para o fetch
    const options: any = {
      method,
      headers,
      timeout: 10000, // 10 segundos
    };

    // Adicionar corpo da requisição se necessário
    if (data) {
      options.body = JSON.stringify(data);
    }

    // Fazer a requisição
    const response = await fetch(url, options);

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok && response.status >= 500) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    // Converter a resposta para JSON
    const responseData = await response.json();
    return responseData as T;
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        `Could not connect to server at ${url}. Please check if the server is running and the host is correct.`
      );
    }
    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new Error(
        `Connection timed out. Please check your network connection and the server status.`
      );
    }
    if (error.response) {
      throw new Error(
        error.response.data.message ||
          (typeof error.response.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response.data) ||
          "Request error"
      );
    }
    throw new Error(error.message || "Unknown error occurred");
  }
}
