# Incremental Astro builds

## Context

I read a blog post from Astro ((Content Layer: A Deep Dive)[content-layer-blog]) that made me want to explore incremental builds more.

Key takeaways from the post:

- Astro content loaders update a local data store.
- If this store persists between builds (as it already does in the local dev environment), a content loader can choose to incrementally update the store.
- This pattern is ideal for content that
  - Lives on a site large enough to be worth building incrementally (thousands of files, maybe tens of thousands)
  - Is not updating in real time

The examples they gave were a blog, or a large e-commerce site with lots of products that need to be updated at times.

## Goal

Understand more about my options for accomplishing this sort of incremental build. I'm going to scope it to local content (.md files that live in the same repo as the overall Astro site), but I would expect remote content to work similarly.

## Questions

### What is the nature of data-store.json at scale?

#### Where is the data store created?

TODO

#### How large is the data store for tens of thousands of files?

TODO

#### What is the most performant way to persist a large data-store.json file between builds in ephemeral environments?

TODO

#### What is the most performant way to query a large data-store.json file?

TODO

### What is the fastest way to obtain the modified timestamp of each local content file?

TODO: I'm assuming I could use .git, but I'm interested in knowing how performant that is at scale.

### How much faster is an incremental Astro build vs. a whole build?

TODO: How much faster is it to build just one updated file versus building all of the files? This is a benchmark for a local build, so it's only intended to benchmark the diff between the two types, not the actual build time as it would run in CI.

### How do content loaders work?

TODO: I'm just looking to understand their conventions around structure, data types, etc., not how they work under the hood.

## Tasks

- [x] Create a vanilla Astro Starlight site
- [x] Generate 5K content files of varying size (we'll just start with `.md` extension), broken into directories
- [x] Add the generated files to a content collection using the OOTB glob loader
- [x] Benchmark the full cold build (`rm -rf .astro && npx astro build`): 82s
- [x] Benchmark the warm build: 11s
- [ ] Explore the data store to answer open questions
- [ ] Write a custom loader (no incremental logic for now), and use that instead of the OOTB glob loader

## Notes

### Data store discovery

The post says "When `astro build` or `astro dev` is run, the loader for each collection is invoked in parallel. These loaders update their own scoped data store, which is preserved between builds."

But I can only find the data store file after `astro dev`. I'm having trouble finding it after `astro build`.

After `astro dev`, the data store seems to be .astro/data-store.json within the site directory, especially since it contains the data described in [the DataStore documentation][data-store-documentation].

[content-layer-blog]: https://astro.build/blog/content-layer-deep-dive/
[data-store-documentation]: https://docs.astro.build/en/reference/content-loader-reference/#datastore
