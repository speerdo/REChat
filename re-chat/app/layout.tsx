import '@/styles/globals.css';

export const metadata = {
  title: 'Re-Chat',
  description: 'Re-Chat is a chatbot that has up to date information about Real Estate in Hamilton County, Indiana.',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

export default RootLayout;
