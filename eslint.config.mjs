import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      ".codex/**",
      ".next/**",
      "coverage/**",
      "index.html",
      "node_modules/**",
      "out/**",
    ],
  },
];

export default eslintConfig;
