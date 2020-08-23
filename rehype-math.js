let h = require('hastscript')
let visit = require('unist-util-visit-parents')

module.exports = attacher

function attacher() {
  console.log('attached!')
  return transformer
}

function transformer(tree, file) {
  visit(tree, 'text', visitor)

  function visitor(node, ancestors) {
    console.log(node, '\n')
    console.assert(node.type === 'text')
    let tex = node.value
    try {
      let nodes = splitOnTeX(tex)
      let parent = ancestors[ancestors.length - 1]
      let index = parent.children.findIndex((child) => child === node)
      parent.children.splice(index, 1, ...nodes)
      return index + nodes.length
    } catch {
      file.message('Bad dollar signs.')
    }
  }
}
function splitOnTeX(s) {
  let parts = []
  let mode = 'text'
  let buf = ''
  let i = 0
  while (i < s.length) {
    if (s[i] === '$' && s[i - 1] === '\\') {
      buf = buf.slice(0, -1) + '$'
    } else if (s[i] === '$') {
      if (mode === 'text') {
        pushNode(text)
        if (s[i + 1] === '$') {
          mode = 'mathDisplay'
          i++
        } else {
          mode = 'mathInline'
        }
      } else if (mode === 'mathInline') {
        pushNode(mathInline)
        mode = 'text'
      } else {
        // mode === "mathDisplay"
        if (s[i + 1] === '$') {
          pushNode(mathDisplay)
          mode = 'text'
          i++
        } else {
          throw new Error(`Expected $ at position ${i + 1}`)
        }
      }
    } else {
      buf += s[i]
    }
    i++
  }
  if (mode === 'text') {
    pushNode(text)
  } else {
    throw new Error(`Text node ends in math mode.`)
  }
  return parts

  function pushNode(makeNode) {
    if (buf !== '') {
      parts.push(makeNode(buf))
      buf = ''
    }
  }
}

function text(value) {
  return { type: 'text', value }
}

function mathInline(tex) {
  return h('span', { class: 'math-inline' }, [tex])
}

function mathDisplay(tex) {
  return h('div', { class: 'math-display' }, [tex])
}
