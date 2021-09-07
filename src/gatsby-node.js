import { URL } from 'url';
import { parseBibFile } from 'bibtex';
import _ from 'lodash';

function getRaw(allContent, key) {
  let openbib = /@\s*\w+\s*{(.+),/gm;
  let groups = null;
  while ((groups = openbib.exec(allContent)) !== null) {
    if (groups[1].trim().toLowerCase() !== key.trim().toLowerCase()) {
      continue;
    } else {
      let startIndex = openbib.lastIndex - groups[0].length;
      let index = openbib.lastIndex;
      let escaped = false;
      let stack = 0;
      while (index < allContent.length) {
        switch(allContent.charAt(index)) {
          case '{':
            if (escaped) { escaped = false; break };
            escaped = false;
            stack = stack + 1;
            break;
          case '}':
            if (escaped) { escaped = false; break };
            escaped = false;
            if (stack === 0){
                return allContent.substring(startIndex, index + 1)
            } else {
              stack = stack - 1;
            };
            break;
          case '\\':
            escaped = true;
            break;
          default:
            escaped = false;
            break;
        }
        index = index + 1;
      }
    }
  }
  return null; // That should not happen but let us not break compilation if it happens.
}

String.prototype.replaceAll = function (search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
}

function getYoutubeId(ytstring) {
  if (ytstring) {
    let is_link = ytstring.includes("youtube.com");
    let id = null;
    if (is_link) {
      let url = new URL(ytstring);
      id = url.searchParams.get('v');
    } else {
      id = ytstring // if it's not a link we're assuming it's the id
    }
    return id
  } else {
    return null
  }
}

function cleanAccents(str) {
  return str
          .replaceAll("\\\\'e", "é")
          .replaceAll("\\\\ss", "ß")
          .replaceAll("\\\\\"A", "Ä")
          .replaceAll("\\\\\"a", "ä")
          .replaceAll("\\\\\"E", "Ë")
          .replaceAll("\\\\\"e", "ë")
          .replaceAll("\\\\\"O", "Ö")
          .replaceAll("\\\\\"o", "ö")
          .replaceAll("\\\\\"U", "Ü")
          .replaceAll("\\\\\"u", "ü")
          .replaceAll("\\\\\~A", "Ã")
          .replaceAll("\\\\\~a", "ã")
          .replaceAll("\\\\'c", "ć")
          .replaceAll("\\\\'E", "É")
          .replaceAll(",", " ")
}

function jsonOfEntry(entry) {
  const authors = _.map(entry.getAuthors().authors$, (auth, _) => auth.firstNames + " " + auth.lastNames).map(cleanAccents).map(x => x.trim());
  const date = (entry.getFieldAsString('issue_date') ? entry.getFieldAsString('issue_date') : entry.getFieldAsString('year') ? entry.getFieldAsString('year') : entry.getFieldAsString('date')).toString();
  const youtubeId = entry.getFieldAsString('youtubeId') ? entry.getFieldAsString('youtubeId') : getYoutubeId(entry.getFieldAsString('youtube'));
  const entry_type = entry.type;
  const ret = {};
  Object.keys(entry.fields).forEach(k => {
    ret[k] = entry.getFieldAsString(k);
  })
  return {
    ...ret,
    authors,
    date,
    youtubeId,
    entry_type
  }
}

async function onCreateNode(
    { node, actions, loadNodeContent, createNodeId, createContentDigest },
    // options
  ) {
    const { createNode, createParentChildLink } = actions
    if (node.extension !== `bib`) {
      return
    };
    // Load CSV contents
    const content = await loadNodeContent(node);
    // Parse
    const bib = parseBibFile(content);
    const keys = Object.keys(bib.entries$);
    const onlyFieldsWithKey = _.map(keys, (key) => { 
      const obj = jsonOfEntry(bib.getEntry(key));
      obj.key = key;
      return obj
     });
    if (_.isArray(onlyFieldsWithKey)) {
      const bibArray = onlyFieldsWithKey.map((ref) => {
        return {
          ...ref,
          raw: getRaw(content, ref.key),
          id: createNodeId(`${node.id} ${ref.key} >>> BIBTEX`),
          children: [],
          parent: node.id,
          internal: {
            contentDigest: createContentDigest(ref),
            type: _.upperFirst(_.camelCase(`Reference`)),
          },
        }
      })
      _.each(bibArray, y => {
        createNode(y)
        createParentChildLink({ parent: node, child: y })
      })
    }
  
    return
  }

exports.onCreateNode = onCreateNode;
