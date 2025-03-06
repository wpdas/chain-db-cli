import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface CreateDatabaseOptions {
  name: string;
  user: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function createDatabase(
  options: CreateDatabaseOptions
): Promise<void> {
  const spinner = ora("Creating database...").start();

  try {
    const response = await apiRequest<ApiResponse>(
      "POST",
      "database/create",
      {
        name: options.name,
        user: options.user,
        password: options.password,
      },
      false // No authentication required
    );

    if (response.success) {
      spinner.succeed(
        chalk.green(`Database '${options.name}' created successfully!`)
      );
      process.exit(0);
    } else {
      spinner.fail(chalk.red(`Failed to create database: ${response.message}`));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error creating database: ${error.message}`));
    process.exit(1);
  }
}
