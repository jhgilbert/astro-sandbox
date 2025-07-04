export default function buildMetadataPlugin() {
  return {
    name: "astro-build-metadata-plugin",
    hooks: {
      "astro:build:start": async () => {
        console.log("🛠️ Astro build is starting...");
      },
    },
  };
}
