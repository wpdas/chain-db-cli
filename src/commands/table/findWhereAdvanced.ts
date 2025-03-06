import chalk from "chalk";
import ora from "ora";
import { apiRequest } from "../../utils/api";

interface FindWhereAdvancedOptions {
  criteria: string;
  limit: string;
  reverse: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any[];
}

export async function findWhereAdvanced(
  tableName: string,
  options: FindWhereAdvancedOptions
): Promise<void> {
  const spinner = ora(
    `Performing advanced search in table '${tableName}'...`
  ).start();

  try {
    // Convert JSON string to object
    let criteriaObj;
    try {
      criteriaObj = JSON.parse(options.criteria);
    } catch (error) {
      spinner.fail(
        chalk.red("Error: The provided criteria is not valid JSON.")
      );
      process.exit(1);
    }

    // Check if criteria is in the correct format (array)
    if (!Array.isArray(criteriaObj)) {
      spinner.fail(
        chalk.red("Error: Advanced criteria must be an array of objects.")
      );
      process.exit(1);
    }

    // Check if each criterion has the required fields
    for (const criterion of criteriaObj) {
      if (
        !criterion.field ||
        !criterion.operator ||
        criterion.value === undefined
      ) {
        spinner.fail(
          chalk.red(
            'Error: Each criterion must have "field", "operator", and "value" fields.'
          )
        );
        process.exit(1);
      }
    }

    const limit = parseInt(options.limit);

    if (isNaN(limit) || limit <= 0) {
      spinner.fail(chalk.red("Error: The limit must be a positive number."));
      process.exit(1);
    }

    const response = await apiRequest<ApiResponse>(
      "POST",
      `table/${tableName}/find-advanced`,
      {
        criteria: criteriaObj,
        limit,
        reverse: options.reverse,
      }
    );

    if (response.success) {
      spinner.succeed(
        chalk.green(
          `Advanced search in table '${tableName}' completed successfully!`
        )
      );

      // Display results
      if (response.data && response.data.length > 0) {
        console.log(
          chalk.cyan(`\nResults (${response.data.length} records found):`)
        );

        response.data.forEach((record, index) => {
          console.log(chalk.yellow(`\n[Record ${index + 1}]`));
          console.log(JSON.stringify(record, null, 2));
        });
      } else {
        console.log(
          chalk.yellow("\nNo records found matching the provided criteria.")
        );
      }
      process.exit(0);
    } else {
      spinner.fail(chalk.red(`Advanced search failed: ${response.message}`));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Advanced search error: ${error.message}`));
    process.exit(1);
  }
}
