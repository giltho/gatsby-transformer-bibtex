# Gatsby transformer Bibtex

This plugin relies on `gatsby-source-filesystem` to detect `bibtex` files in your project and provide the associated nodes in GraphQL queries.

## Usage


### Adding the plugin

In your `gatsby-config.js`, add `gatsby-source-filesystem` and `gatsby-transformer-bibtex`, making sure that the former is **before** the latter.

```js
plugins: [
  // ...,
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `documents`,
      path: `${__dirname}/src/assets/documents`,
    },
  },
  'gatsby-transformer-bibtex',
  // ...
]
```

The path you specify in the options of `gatsby-source-filesystem` must contain **all** the bibtex files, with a `.bib` extension.

### Static Queries

Once added, the plugin will add `Reference` nodes to your GraphQL queries, allowing you for example to write the following query in a StaticQuery component or a page:

```graphql
query {
  allReference {
    edges {
      node {
        key
        title
        authors
        journal
        date
      }
    }
  }
}
```

### Working with files

`Reference` nodes may contain a `file` field if you specified it in your Bibtex file. The type of this field is the `File` type provided by `gatsby-source-filesystem`. In particular, it contains a `publicURL` field that is useful if you want to add a link to the file.

For example, if the path you gave to `gatsby-source-fileystem` contains
```
publications
    ├── paper_a.pdf
    └── publications.bib
```

where `publications.bib` contains
```bibtex
@article{some_key,
 author = {Name, Your and Of-Yours, Coauthor},
 title = {Paper A},
 ...
 file = {paper_a.pdf} % path relative to where this .bib file is
} 
```

Then you can create a component in the following way:
```js
import React from "react"
import { StaticQuery, graphql } from "gatsby"

const ComponentName = () => (
  <StaticQuery
    query={graphql`
      {
        reference(key: {eq: "some_key"}) {
          file {
            publicURL
          }
        }
      }
    `}
    render={data => <a href={data.reference.file.publicURL}>Link to Paper A</a>}
  ></StaticQuery>
)

export default ComponentName
```

Note that there is also a `slides` field that works in exactly the same way.

## Current limitations

For now, only the following bibtex fields are available in queries:

- `raw` : `string` (the entire citation in raw format)
- `key` : `string` (lower-cased bibtex key)
- `type` : `string` (`@article {...}` has the type `article`)
- `title` : `string`
- `abstract` : `string`
- `authors` : `string[]`
- `url` : `string`
- `doi` : `string`
- `date` : `string`
- `journal` : `string`
- `file` : `File`
- `slides` : `File`
- `preprint` : `string` if it's a URL or `File` if it's a local file.
- `youtubeId` : `string` (note that if the bibtex contains a youtube link, the video's ID is extracted)


## Contributions

This project is not extremely mature, but I've had feedback that it is used. PRs and issues are more than welcome :)

## LICENSE

This project is under MIT License, see License file.