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

### Special fields

Every field is simply the string value that was in the corresponding Bibtex entry, except for some fields that have a special behaviour.

- The `entry_type` field contains the type of the entry. For example, an entry starting with `@article{...` will have `"article"` in its `entry_type` field.
- The `date` field is either the provided `issue_date` if it exists, or `year` if it does not. It is always a `string`.
- The `authors` field is a list of the authors' names, that has been extracted from the bibtex.
- The `raw` field contains the entire bibtex entry as a raw string.
- The `youtubeId` is created if a `youtube` field is in your bibtex file. If your `youtube` field contains a youtubeId, it's just copied, if it contains a youtube link, the id is extracted from it.

### Working with files

It is possible to work with local files, and to create fields of type `File` in your nodes.
If in *every of your entries*, for a given field, the value is not specified (`null`) or it is a relative path to a file, then Gatsby will transform it into a `File` field provided by `gatsby-source-filesystem`. In particular, this field contains a `publicURL` field that is useful if you want to add a link to the file. 

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

## Contributions

This project is not extremely mature, but I've had feedback that it is used. PRs and issues are more than welcome 😁

## LICENSE

This project is under MIT License, see License file.