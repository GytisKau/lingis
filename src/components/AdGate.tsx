import {
  IonIcon,
  IonModal,
} from "@ionic/react";
import { close } from "ionicons/icons";
import "./AdGate.css";

interface AdGateProps {
  isOpen: boolean;
  onContinue: () => void;
}

const AdGate: React.FC<AdGateProps> = ({ isOpen, onContinue }) => {
  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      className="ad-gate-modal"
    >
      <div className="ad-full-page">
        <button
          type="button"
          className="ad-close-button"
          onClick={onContinue}
          aria-label="Close advertisement"
        >
          <IonIcon icon={close} />
        </button>

        <div className="ad-card">
          <p className="ad-label">Advertisement</p>

          <div className="ad-visual">
            <div className="ad-sparkle ad-sparkle-one" />
            <div className="ad-sparkle ad-sparkle-two" />
            <div className="ad-sparkle ad-sparkle-three" />

            <h1>Ad space</h1>
            <p>Your future ad will appear here</p>
          </div>

          <div className="ad-text-box">
            <h2>Take a tiny pause</h2>
            <p>
              This space is reserved for non-premium users. Premium users skip ads
              completely.
            </p>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default AdGate;