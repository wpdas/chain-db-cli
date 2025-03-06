import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface ChangePasswordOptions {
  name: string;
  user: string;
  oldPassword: string;
  newPassword: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export async function changePassword(
  options: ChangePasswordOptions
): Promise<void> {
  const spinner = ora("Changing database password...").start();

  try {
    const response = await apiRequest<ApiResponse>(
      "POST",
      "database/change-password",
      {
        name: options.name,
        user: options.user,
        old_password: options.oldPassword,
        new_password: options.newPassword,
      },
      false // No authentication required
    );

    if (response.success) {
      spinner.succeed(chalk.green("Password changed successfully!"));
      console.log(
        chalk.yellow(
          "Important: You will need to connect again with the new password."
        )
      );
      process.exit(0);
    } else {
      spinner.fail(chalk.red(`Failed to change password: ${response.message}`));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Error changing password: ${error.message}`));
    process.exit(1);
  }
}
