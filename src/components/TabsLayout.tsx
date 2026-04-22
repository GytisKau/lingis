import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import {
  calendarOutline,
  statsChartOutline,
  bookOutline,
  personOutline
} from "ionicons/icons";

import { Redirect, Route } from "react-router";
import Tab1 from "../pages/Tab1";
import Tab2 from "../pages/Tab2";
import Tab3 from "../pages/Tab3";
import Tab4 from "../pages/Tab4";
import Tab5 from "../pages/Tab5";
import Session from "../pages/Session";
import SessionView from "../pages/SessionView";
import AssignmentsView from "../pages/AssignmentView";

const TabsLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet animated={false}>
        <Route path="/tabs/tab1" component={Tab1} exact />
        <Route path="/tabs/tab2" component={Tab2} exact />
        <Route path="/tabs/tab3" component={Tab3} exact />
        <Route path="/tabs/tab4" component={Tab4} exact />
        <Route path="/tabs/tab5" component={Tab5} exact />
        <Route path="/tabs/tab3/session/:id" component={Session} exact />
        <Route path="/tabs/tab3/viewsession/:id" component={SessionView} exact />
        <Route path="/tabs/tab4/viewassignment/:id" component={AssignmentsView} exact />
        <Redirect exact from="/tabs" to="/tabs/tab1" />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tabs/tab1">
          <IonIcon icon={calendarOutline} />
          <IonLabel>Calendar</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab2" href="/tabs/tab2">
          <IonIcon icon={statsChartOutline} />
          <IonLabel>Stats</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab3" href="/tabs/tab3">
          <img src="/logo.svg" alt="Home" />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab4" href="/tabs/tab4">
          <IonIcon icon={bookOutline} />
          <IonLabel>Plan</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab5" href="/tabs/tab5">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsLayout;