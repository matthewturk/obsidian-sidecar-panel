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

## License

This template is available under the [MIT License](LICENSE). Feel free to modify
and use it to create your own Obsidian plugins.
