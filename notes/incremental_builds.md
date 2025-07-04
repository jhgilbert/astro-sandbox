# Incremental Astro builds

## Context

I read a blog post from Astro ((Content Layer: A Deep Dive)[content-layer-blog]) that made me want to explore incremental builds more.

Key takeaways from the post:

- Astro content loaders update a local data store, feeding content into it.
- This data store can persist between builds as a cached artifact.
- Loaders only have access to their section of the data store.
- Loaders can choose to overwrite their entire portion of the data store, or just update some parts of it depending on some condition (like the last modified date of a piece of content).
- This incremental update pattern is ideal for content that
  - Lives on a site large enough to be worth building incrementally (thousands of files, maybe tens of thousands)
  - Is not updating in real time

The examples they gave were a blog, or a large e-commerce site with lots of products that need to be updated at times.

## Goal

Understand more about my options for accomplishing this sort of incremental build. I'm going to scope it to local content (.md files that live in the same repo as the overall Astro site), but I would expect remote content to work similarly.

## Questions

### What is the nature of data-store.json at scale?

#### Where is the data store created?

In dev mode, you can find it at `.astro/data-store.json`. After a production build, you'll find it in `node_modules/.astro/data-store.json` by default, but you can configure your `cacheDir` in `astro.config.mjs` to use a different location.

#### How large is the data store?

So far, the data store comes out to about ~4.5x the size of the original content directory. This assumes that all content is plain Markdown, and that no content lives outside that directory. Neither will be true in real life, so this is a rough estimate.

In a benchmark using ~1000 simulated doc files:

- The content directory is 6.3 MB.
- The data store is 27.7 MB, or about 4.4x the size of the content directory.

In a benchmark using ~5000 simulated doc files:

- The content directory is 31.7 MB.
- The data store is 143 MB, or about 4.5x the size of the content directory.

In the Datadog docs site (16,156 files in the content directory at last count):

- The content directory is 150 MB.
- I'm not able to generate a data store for this content yet, but 4.5x of the current content directory size would be 675 MB.

#### How would I incrementally update a persisted data store?

For the sake of simplicity, it would be nice if everything I needed could be provided by the data store itself, and by info already available in directories like .git.

The loader could store its last load time as metadata in the store:

```
const previousLastModified = meta.get("lastModified");
meta.set("lastModified", new Date().toISOString());
```

If the .git modified timestamp of a given file is more recent than that last load time, the content in that file should be loaded again. Otherwise, the file can be skipped.

TODO: Confirm that the collection metadata is also stored in the data-store.json file.

### What is the fastest way to obtain the modified timestamp of each local content file?

TODO: I'm assuming I could use .git, but I'm interested in knowing how performant that is at scale.

#### What is the most performant way to persist a large data-store.json file between builds in ephemeral environments?

TODO

#### What is the most performant way to query a large data-store.json file?

TODO

### How much faster is an incremental Astro build vs. a whole build?

TODO: How much faster is it to build just one updated file versus building all of the files? This is a benchmark for a local build, so it's only intended to benchmark the diff between the two types, not the actual build time as it would run in CI.

### How do content loaders work?

TODO: I'm just looking to understand their conventions around structure, data types, etc., not how they work under the hood.

## Tasks

- [x] Create a vanilla Astro Starlight site
- [x] Generate 5K content files of varying size (we'll just start with `.md` extension), broken into directories
- [x] Add the generated files to a content collection using the OOTB glob loader
- [x] Benchmark the full cold build with ~5000 files (`rm -rf .astro && npx astro build`): 87s
- [x] Benchmark the warm build with ~5000 files: 11s
- [ ] Explore the data store to answer open questions
- [ ] Write a custom loader (no incremental logic for now), and use that instead of the OOTB glob loader

## Notes

### Data store discovery notes

The post says "When `astro build` or `astro dev` is run, the loader for each collection is invoked in parallel. These loaders update their own scoped data store, which is preserved between builds."

After `astro dev`, the data store is in .astro/data-store.json within the site directory, especially since it contains the data described in [the DataStore documentation][data-store-documentation].

After `astro build`, it's in `node_modules/.astro` unless configured otherwise with the [`cacheDir` config key](cachedir-docs).

I updated my `astro.config.mjs` to make this folder a bit easier to find:

```javascript
export default defineConfig({
  cacheDir: "astro-cache",
  // additional config here
});
```

I also added `astro-cache` to my .gitignore.

[content-layer-blog]: https://astro.build/blog/content-layer-deep-dive/
[data-store-documentation]: https://docs.astro.build/en/reference/content-loader-reference/#datastore
[cachedir-docs]: https://docs.astro.build/en/reference/configuration-reference/#cachedir
