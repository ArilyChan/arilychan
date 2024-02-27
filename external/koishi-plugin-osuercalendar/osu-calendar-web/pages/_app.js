import '../styles/globals.css'
import Footer from '../components/footer'

function MyApp({ Component, pageProps }) {
  return (
    <div data-theme="cupcake">
      <Component {...pageProps} />

      <Footer />
    </div>
  )
}

export default MyApp
