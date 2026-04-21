import { useEffect, useMemo, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import {
  BREAK_TYPES,
  BreakLength,
  BreakTypeDefinition
} from '../data/breakSuggestions';

interface BreakTypeSelectorProps {
  breakMinutes: BreakLength;
  resetKey: number;
}

const BreakTypeSelector: React.FC<BreakTypeSelectorProps> = ({
  breakMinutes,
  resetKey
}) => {
  const [selectedType, setSelectedType] = useState<BreakTypeDefinition | null>(null);
  const [infoType, setInfoType] = useState<BreakTypeDefinition | null>(null);

  const availableTypes = useMemo(() => {
    return BREAK_TYPES.filter(
      (type) => (type.suggestions[breakMinutes]?.length ?? 0) > 0
    );
  }, [breakMinutes]);

  useEffect(() => {
    setSelectedType(null);
    setInfoType(null);
  }, [breakMinutes, resetKey]);

  const selectedSuggestions = selectedType?.suggestions[breakMinutes] ?? [];

  return (
    <>
      <div className="break-helper-card">
        {!selectedType ? (
          <>
            <div className="break-helper-head">
              <p className="break-helper-eyebrow">{breakMinutes}-minute break</p>
              <h3 className="break-helper-title">Choose your break type</h3>
            </div>

            <div className="break-type-list">
              {availableTypes.map((type) => (
                <div key={type.key} className="break-type-row">
                  <button
                    type="button"
                    className="break-type-main"
                    onClick={() => setSelectedType(type)}
                  >
                    <span className="break-type-main-title">{type.title}</span>
                    <span className="break-type-main-subtitle">
                      See break suggestions
                    </span>
                  </button>

                  <button
                    type="button"
                    className="break-type-info"
                    onClick={() => setInfoType(type)}
                    aria-label={`More info about ${type.title}`}
                  >
                    <IonIcon icon={informationCircleOutline} />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="break-helper-head">
              <p className="break-helper-eyebrow">{breakMinutes}-minute break</p>
              <h3 className="break-helper-title">{selectedType.title}</h3>
            </div>

            <ul className="break-suggestion-list">
              {selectedSuggestions.map((suggestion, index) => (
                <li key={index} className="break-suggestion-item">
                  {suggestion}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="break-change-button"
              onClick={() => setSelectedType(null)}
            >
              Choose another break type
            </button>
          </>
        )}
      </div>

      <IonModal
        isOpen={!!infoType}
        onDidDismiss={() => setInfoType(null)}
        className="break-info-modal"
      >
        <IonHeader>
        <IonToolbar className="break-info-toolbar">
            <div className="break-info-title">
            {infoType?.title ?? ''}
            </div>

            <IonButtons slot="end">
            <IonButton
                fill="clear"
                className="close-x"
                onClick={() => setInfoType(null)}
            >
                ✕
            </IonButton>
            </IonButtons>
        </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding break-info-content">
          <p className="break-info-text">{infoType?.description}</p>
        </IonContent>
      </IonModal>
    </>
  );
};

export default BreakTypeSelector;