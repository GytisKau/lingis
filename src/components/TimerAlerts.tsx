import { IonAlert } from '@ionic/react';
import { IonAlertCustomEvent, OverlayEventDetail } from "@ionic/core/components";

interface TimerAlertsProps {
  showStudyAlert: boolean;
  showBreakAlert: boolean;
  onCloseStudy: () => void;
  onCloseBreak: () => void;
  onExtendStudy: (minutes: number) => void;
  onExtendBreak: (minutes: number) => void;
  onGoBreak: () => void;
  onGoStudy: () => void;
}

export const TimerAlerts = ({
  showStudyAlert,
  showBreakAlert,
  onCloseStudy,
  onCloseBreak,
  onExtendStudy,
  onExtendBreak,
  onGoBreak,
  onGoStudy
}: TimerAlertsProps) => (
  <>
    <IonAlert
      isOpen={showStudyAlert}
      onDidDismiss={(event) => {
        if(event.detail.role === "extend"){
          onExtendStudy(event.detail.data.values);
        } else {
          onGoBreak();
        }
        onCloseStudy();
      }}
      header="Study session finished"
      message="Do you want to extend the session?"
      inputs={[
          {
            label: 'Extend 5 minutes',
            type: 'radio',
            value: 5,
            checked: true
          },
          {
            label: 'Extend 10 minutes',
            type: 'radio',
            value: 10,
          },
        ]}
      buttons={[
        { text: 'Cancel' },
        { text: 'Extend', role: "extend" }
      ]}
    />

    <IonAlert
      isOpen={showBreakAlert}
      onDidDismiss={(event) => {
        if(event.detail.role === "extend"){
          onExtendBreak(event.detail.data.values);
        } else {
          onGoStudy();
        }
        onCloseBreak();
      }}
      header="Break finished"
      message="Do you want to extend the break?"
      inputs={[
        {
          label: 'Extend 5 minutes',
          type: 'radio',
          value: 5,
          checked: true
        },
        {
          label: 'Extend 10 minutes',
          type: 'radio',
          value: 10,
        },
        {
          label: 'Extend 20 minutes',
          type: 'radio',
          value: 20,
        },
      ]}
      buttons={[
        { text: 'Cancel' },
        { text: 'Extend', role: "extend" }
      ]}
    />
  </>
);