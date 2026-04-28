import { IonAlert } from '@ionic/react';

export const TimerAlerts = ({
  showStudyAlert,
  showBreakAlert,
  onCloseStudy,
  onCloseBreak,
  onExtendStudy,
  onExtendBreak,
  onGoBreak,
  onGoHome
}: any) => (
  <>
    <IonAlert
      isOpen={showStudyAlert}
      onDidDismiss={onCloseStudy}
      header="Study session finished"
      message="Extend?"
      buttons={[
        { text: '+5', handler: () => onExtendStudy(5) },
        { text: '+10', handler: () => onExtendStudy(10) },
        {
          text: 'No',
          role: 'cancel',
          handler: onGoBreak
        }
      ]}
    />

    <IonAlert
      isOpen={showBreakAlert}
      onDidDismiss={onCloseBreak}
      header="Break finished"
      buttons={[
        { text: '+1', handler: () => onExtendBreak(1) },
        {
          text: 'New session',
          handler: onGoHome
        }
      ]}
    />
  </>
);