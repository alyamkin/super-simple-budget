import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Recharts is code-split with the results: import it only from the chart
  // components (Spec §10.0).
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    ignores: ["features/results/components/charts/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "recharts",
              message:
                "Import Recharts only in features/results/components/charts/.",
            },
          ],
          patterns: [
            {
              group: ["recharts/*"],
              message:
                "Import Recharts only in features/results/components/charts/.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
