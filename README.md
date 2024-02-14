# Sidecar Contextual Panel for Obsidian

This is a plugin that enables you to display a contextual sidebar for given
files, based on the content of a `sidebar-panel` frontmatter property.

These files are rendered as though they are coming from the file in which the
property is set; this enables you to use plugins such as
[obsidian-meta-bind](https://github.com/mProjectsCode/obsidian-meta-bind-plugin)
to create `INPUT` fields that bind to the parent, rather than to the panel
source itself.

One use case, which motivated me to make this, was that I often want to have
different contextual buttons or metadata input lists that display to the side,
so that while I am editing a file I don't have to scroll to the top to change,
for instance, the attendees of a meeting.

## How to Use

Right now there aren't any settings.  All you have to do is set the property
`sidecar-panel` in a file (perhaps in a template!) to enable it.  When a file
with that set is open and focused, the right leaf will include that sidecar
panel.

For instance, if you have `mysidecar.md` in your Vault with this content:

```
`INPUT[number:somenumber]`

````
INPUT[list:somelist]
````

```

And then another file, `example.md`, with the property `sidecar-panel` set to
`[[mysidecar.md]]`, when you open it the sidecar panel would display that set of
widgets which -- crucially! -- will modify `example.md` rather than
`mysidecar.md`.  Now you have a widget that'll be visible all the time, settable
on a per-file basis, to keep handy buttons and other things visible.

## Roadmap

- [ ] Add support for [metadatamenu](https://github.com/mdelobelle/metadatamenu) `fileClass`es to apply `sidecar-panel` attributes across queries.
- [ ] Add per-tag support, so that not all files have to have their properties modified to benefit.
- [ ] Better support changes in properties and sidecar files for open files.

## License

This template is available under the [MIT License](LICENSE). Feel free to modify
and use it to create your own Obsidian plugins.
