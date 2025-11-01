'use client';
import PropTypes from 'prop-types';


// project imports
import ThemeCustomization from 'themes';
import { Provider } from 'react-redux';
import { store } from '../store';
import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import RTLLayout from 'components/RTLLayout';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

import { ConfigProvider } from 'contexts/ConfigContext';
import HydrateAuth from './HydrateAuth';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function ProviderWrapper({ children }) {


  return (
    <ConfigProvider>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <Provider store={store}>
                <HydrateAuth />
                <Notistack>
                  <Snackbar />
                  {children}
                </Notistack>
              </Provider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
    </ConfigProvider>
  );
}

ProviderWrapper.propTypes = { children: PropTypes.node };
