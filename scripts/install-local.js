#!/usr/bin/env node
import { installLocal } from "../src/local-install.js";

try {
  await installLocal();
} catch (error) {
  console.error(`Atlas Core installation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
