export default {
  "apps/web/**/*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"],
  "apps/worker/**/*.py": () => "bash -c 'cd apps/worker && uv run ruff format .'",
};