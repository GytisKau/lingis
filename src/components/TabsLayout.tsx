import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { ellipse, square, triangle } from "ionicons/icons";
import { Redirect, Route } from "react-router";
import Tab1 from "../pages/Tab1";
import Tab2 from "../pages/Tab2";
import Tab3 from "../pages/Tab3";
import Tab4 from "../pages/Tab4";
import Tab5 from "../pages/Tab5";
import Session from '../pages/Session';
import SessionView from "../pages/SessionView";
import AssignmentsView from "../pages/AssignmentView";

const TabsLayout: React.FC = () => (
  <IonTabs>

    <IonRouterOutlet>
      <Route path="/tabs/tab1" component={Tab1} exact />
      <Route path="/tabs/tab2" component={Tab2} exact />
      <Route path="/tabs/tab3" component={Tab3} exact />
      <Route path="/tabs/tab4" component={Tab4} exact />
      <Route path="/tabs/tab5" component={Tab5} exact />

      <Route path="/tabs/tab3/session" component={Session} exact />
      <Route path="/tabs/tab3/viewsession" component={SessionView} exact />
      <Route path="/tabs/tab4/viewassignment/:id" component={AssignmentsView} exact />

      <Redirect exact from="/tabs" to="/tabs/tab1" />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tabs/tab1">
        <IonIcon icon={triangle} />
        <IonLabel>Calendar</IonLabel>
      </IonTabButton>

      <IonTabButton tab="tab2" href="/tabs/tab2">
        <IonIcon icon={ellipse} />
        <IonLabel>Stats</IonLabel>
      </IonTabButton>

      <IonTabButton tab="tab3" href="/tabs/tab3">
        <IonIcon icon={square} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>

      <IonTabButton tab="tab4" href="/tabs/tab4">
        <IonIcon icon={ellipse} />
        <IonLabel>Plan</IonLabel>
      </IonTabButton>

      <IonTabButton tab="tab5" href="/tabs/tab5">
        <IonIcon icon={square} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>

  </IonTabs>
)

export default TabsLayout;