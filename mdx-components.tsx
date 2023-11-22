import { titleToMarkdownId } from '@utils/utils'
import type { MDXComponents } from 'mdx/types'

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: (props) => (
      <h1
        {...props}
        id={
          props.children
            ? titleToMarkdownId(props.children as string)
            : undefined
        }
      >
        {props.children}
      </h1>
    ),
    h2: (props) => (
      <h2
        {...props}
        id={
          props.children
            ? titleToMarkdownId(props.children as string)
            : undefined
        }
      >
        {props.children}
      </h2>
    ),
    h3: (props) => (
      <h3
        {...props}
        id={
          props.children
            ? titleToMarkdownId(props.children as string)
            : undefined
        }
      >
        {props.children}
      </h3>
    ),
    ...components,
  }
}
