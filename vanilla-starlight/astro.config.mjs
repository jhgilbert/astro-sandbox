// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import buildMetadataPlugin from "./plugins/astro-build-metadata";

// https://astro.build/config
export default defineConfig({
  cacheDir: "astro-cache",
  integrations: [
    starlight({
      title: "My Docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
