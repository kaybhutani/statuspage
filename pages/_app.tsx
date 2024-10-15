import React from 'react';
import '../styles/globals.css'; // Import global CSS styles
import { ConfigProvider, theme } from 'antd';
function MyApp({ Component, pageProps }) {
  const {  darkAlgorithm } = theme;
  return (
    <>  
    <ConfigProvider
      // theme={{
      //   token: {
      //     // colorPrimary: "#FA8C16",
      //     colorTextHeading: "#595959",
      //     colorTextBase: "#595959",
      //     colorText: "#595959",
      //     // colorLink: "#FA8C16",
      //     // colorLinkHover: "#FA8C16",
      //   },
      // }}
    //   theme={{algorithm: darkAlgorithm}}
    >


      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
      </ConfigProvider>
    </>
  );
}


const Header = () => (
  <header>
    
  </header>
);

const Footer = () => (
  <footer>
    
  </footer>
);

export default MyApp;
