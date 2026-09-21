import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Three.js objects are mutable by design: R3F scenes update geometry,
  // materials and transforms in place every frame. The React Compiler
  // immutability rules don't apply to that imperative layer.
  {
    files: ["src/components/three/**", "src/components/hero/HeroScene.tsx"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
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
