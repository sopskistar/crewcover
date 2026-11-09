import { fail } from "@agent-native/core/action";

import { SchedulingError } from "../../shared/scheduling";
export async function domain<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof SchedulingError)
      return fail(error.message, {
        errorCode: error.code,
        statusCode: error.status,
      });
    throw error;
  }
}
