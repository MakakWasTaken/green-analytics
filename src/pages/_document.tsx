import createEmotionServer from '@emotion/server/create-instance'
import { getInitColorSchemeScript } from '@mui/joy/styles'
import theme from '@src/styles/theme'
import { createEmotionCache } from '@src/utils/createEmotionCache'
import { AppType } from 'next/app'
import Document, {
  DocumentContext,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import { GAAppProps } from './_app'

interface GADocumentProps extends DocumentProps {
  emotionStyleTags: JSX.Element[]
}

export const GADocument = ({ emotionStyleTags }: GADocumentProps) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content={theme.palette.primary.mainChannel} />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="emotion-insertion-point" content="" />
        <script
          async
          src="http://localhost:3000/green-analytics.js"
          data-token="b3cdaa7c-ca1b-4641-b01f-dace971b7850"
        />
        {emotionStyleTags}
      </Head>
      <body>
        {getInitColorSchemeScript({ defaultMode: 'system' })}
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
GADocument.getInitialProps = async (ctx: DocumentContext) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp:
        (
          App: React.ComponentType<React.ComponentProps<AppType> & GAAppProps>,
        ) =>
        (props) =>
          <App emotionCache={cache} {...props} />,
    })

  const initialProps = await Document.getInitialProps(ctx)
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  return {
    ...initialProps,
    emotionStyleTags,
  }
}

export default GADocument
