export default {
  "apps/web/**/*.{js,jsx,ts,tsx}": [
    "eslint --config apps/web/eslint.config.mjs --fix --max-warnings=0",
    "prettier --write",
  ],
  "apps/web/**/*.{json,css,md}": ["prettier --write"],
  "apps/worker/**/*.py": () =>
    "bash -c 'cd apps/worker && uv run ruff check --fix .; uv run ruff format .'",
};