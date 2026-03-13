import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Tab4 from './pages/Tab4';
import Tab5 from './pages/Tab5';
import Session from './pages/Session';
import SessionView from './pages/SessionView';
import AssignmentView from './pages/AssignmentView';
import LoginWizard from './pages/LoginWizard';
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

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter basename='lingis'>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/tab1" component={Tab1} exact/>
          <Route path="/tab2" component={Tab2} exact/>
          <Route path="/tab3" component={Tab3} exact/>
          <Route path="/tab4" component={Tab4} exact/>
          <Route path="/tab5" component={Tab5} exact/>
          <Route path="/session" component={Session} exact/>
          <Route path="/viewsession" component={SessionView} exact/>
          <Route path="/viewassignment" component={AssignmentView} exact />
          <Route path="/loginwizard" component={LoginWizard} exact/>
          <Redirect exact from='/' to="/tab1"/>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tab1">
            <IonIcon aria-hidden="true" icon={triangle} />
            <IonLabel>Calendar</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2">
            <IonIcon aria-hidden="true" icon={ellipse} />
            <IonLabel>Stats</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab4" href="/tab4">
            <IonIcon aria-hidden="true" icon={ellipse} />
            <IonLabel>Plan</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab5" href="/tab5">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
