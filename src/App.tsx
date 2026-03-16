import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import LoginWizard from './pages/LoginWizard';
import RequireLogin from './components/RequireLogin'
import RequireWizard from './components/RequireWizard'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import TabsLayout from './components/TabsLayout';
import { AuthProvider } from './hooks/useAuth';
import Login from './pages/login';
import RootRedirect from './components/RootRedirect';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter basename="lingis">
        <IonRouterOutlet>
          {/* Public */}
          <Route path="/" component={RootRedirect} exact />
          <Route path="/login" render={() => <Login/>} exact />

          {/* Wizard requires login */}
          <Route
            path="/loginwizard"
            render={() => (
              <RequireLogin>
                <LoginWizard />
              </RequireLogin>
            )}
            exact
          />

          {/* Main app requires login + wizard */}
          <Route
            path="/tabs"
            render={() => (
              <RequireLogin>
                <RequireWizard>
                  <TabsLayout />
                </RequireWizard>
              </RequireLogin>
            )}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
)

export default App;
