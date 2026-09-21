import React from "react"
import { Helmet } from "react-helmet"
import Navbar from "./Navbar"
import Footer from "./Footer"

const Layout = ({ children, title, description }) => {
  const siteTitle = "TempLab — Monitor simple de un ESP32"
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const pageDescription = description || "Monitor simple de un ESP32. Visualiza datos actuales y consulta registros históricos."

  return (
    <>
      <Helmet>
        <html lang="es" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 pt-16" id="main-content" role="main">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout