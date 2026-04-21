import React, { useMemo, useState } from 'react';
import {
  IonContent,
  IonModal,
  IonToast,
  IonButton
} from '@ionic/react';
import { LEARNING_TIPS } from '../data/learningTipsData';
import { getProgressiveDailyTip } from '../utils/dailyTipRotation';
import './DailyLearningTip.css';

const DailyLearningTip: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  const tip = useMemo(() => {
    return getProgressiveDailyTip(LEARNING_TIPS, 'home-learning-tip');
  }, []);

  if (!tip) return null;

  const openMoreInfo = () => {
    if (!navigator.onLine) {
      setShowOfflineToast(true);
      return;
    }

    window.open(tip.moreInfoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <section className={`daily-tip-card daily-tip-card--${tip.theme}`}>
        <p className="daily-tip-card__text">{tip.shortTip}</p>

        <div className="daily-tip-card__actions">
          <button
            type="button"
            className="daily-tip-card__button-plain"
            onClick={() => setIsOpen(true)}
          >
            Read more
          </button>
        </div>
      </section>

      <IonModal
        isOpen={isOpen}
        onDidDismiss={() => setIsOpen(false)}
        className={`learning-tip-modal learning-tip-modal--${tip.theme}`}
      >
        <IonContent className="ion-padding learning-tip-content">
          <div className="learning-tip-body">
            <div className="learning-tip-close-row">
              <IonButton
                fill="clear"
                className="close-x"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </IonButton>
            </div>

            <p className="learning-tip-short">{tip.shortTip}</p>

            <p className="learning-tip-description">{tip.fullExplanation}</p>

            <div className="learning-tip-source-box">
              <p className="learning-tip-source-label">Source</p>
              <p className="learning-tip-source-text">{tip.citation}</p>

              <button
                type="button"
                className="learning-tip-link"
                onClick={openMoreInfo}
              >
                More info
              </button>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showOfflineToast}
        onDidDismiss={() => setShowOfflineToast(false)}
        message="No internet connection"
        duration={1800}
        position="bottom"
      />
    </>
  );
};

export default DailyLearningTip;