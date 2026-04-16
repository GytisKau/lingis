import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import {
  calendarOutline,
  statsChartOutline,
  bookOutline,
  personOutline
} from "ionicons/icons";

import { Redirect, Route, useLocation } from "react-router";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import Tab1 from "../pages/Tab1";
import Tab2 from "../pages/Tab2";
import Tab3 from "../pages/Tab3";
import Tab4 from "../pages/Tab4";
import Tab5 from "../pages/Tab5";
import Session from '../pages/Session';
import SessionView from "../pages/SessionView";
import AssignmentsView from "../pages/AssignmentView";

const TabsLayout: React.FC = () => {
  const location = useLocation();
  const history = useHistory(); // Add this line
  const [activeTab, setActiveTab] = useState("tab1");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("tab1")) setActiveTab("tab1");
    else if (path.includes("tab2")) setActiveTab("tab2");
    else if (path.includes("tab3")) setActiveTab("tab3");
    else if (path.includes("tab4")) setActiveTab("tab4");
    else if (path.includes("tab5")) setActiveTab("tab5");
  }, [location]);

  const handleHomeClick = () => {
    history.push("/tabs/tab3"); // Changed this line
  };

  return (
    <>
      <div 
        className={`floating-home-logo ${activeTab === "tab3" ? "active" : ""}`}
        onClick={handleHomeClick}
      >
        <img src="/logo.svg" alt="Home" />
      </div>

      <IonTabs>
        <IonRouterOutlet>
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
    </>
  );
};

export default TabsLayout;