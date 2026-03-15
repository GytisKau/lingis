import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonDatetime,
  IonList,
  IonRow,
  IonCol,
  IonDatetimeButton,
  IonInput,
  IonGrid,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItemGroup
} from "@ionic/react"

import { useEffect, useRef, useState } from "react"
import { db, LingisEvent } from "../db/db"
import { updateEdited } from "./Calendar";
import { trash } from "ionicons/icons";

interface Props {
  trigger: string;
  freeTimes: LingisEvent[]
}

interface EditableFreeTime {
  start: string
  end: string
}

function formatDateTimeLocal(date: Date) {
  const d = new Date(date) // copy
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const FreeTimeModal: React.FC<Props> = ({ trigger, freeTimes }) => {
  const modalRef = useRef<HTMLIonModalElement>(null)
  const [draft, setDraft] = useState<EditableFreeTime[]>([])

  useEffect(() => {
    loadFreeTime()
  }, [freeTimes])

  const loadFreeTime = () => {
    const copy = freeTimes.map(e => ({
      start: formatDateTimeLocal(e.start),
      end: formatDateTimeLocal(e.end)
    }))

    setDraft(copy)
  }

  const updateStart = (index: number, value: string) => {
    const next = [...draft]
    next[index].start = value
    setDraft(next)
  }

  const updateEnd = (index: number, value: string) => {
    const next = [...draft]
    next[index].end = value
    setDraft(next)
  }

  const addEvent = () => {
    const now = new Date()
    const end = new Date(now.getTime() + 60 * 60000)

    setDraft([
      ...draft,
      {
        start: formatDateTimeLocal(now),
        end: formatDateTimeLocal(end)
      }
    ])
  }

  const removeEvent = (index: number) => {
    setDraft(draft.filter((d, i)  => i != index));
  }

  const confirm = async () => {
    updateEdited(draft.map(d => ({start: new Date(d.start), end: new Date(d.end)})))
    modalRef.current?.dismiss()
    setDraft([])
  }

  const cancel = () => {
    modalRef.current?.dismiss()
    setDraft([])
  }

  return (
    <IonModal ref={modalRef} trigger={trigger} onWillPresent={() => loadFreeTime()}>

      <IonHeader>
        <IonToolbar>

          <IonButtons slot="start">
            <IonButton onClick={cancel}>Cancel</IonButton>
          </IonButtons>

          <IonTitle>Edit Free Time</IonTitle>

          <IonButtons slot="end">
            <IonButton strong onClick={confirm}>
              Confirm
            </IonButton>
          </IonButtons>

        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

  {draft.map((event, i) => (
    <IonList key={i}>
    <IonItemSliding >

      <IonItem>

        <div style={{ width: "100%" }}>

          <IonInput
            label="Start"
            labelPlacement="stacked"
            value={event.start}
            type="datetime-local"
            onIonChange={(e) =>
              updateStart(i, e.detail.value as string)
            }
          />

          <IonInput
            label="End"
            labelPlacement="stacked"
            value={event.end}
            type="datetime-local"
            onIonChange={(e) =>
              updateEnd(i, e.detail.value as string)
            }
          />

        </div>

      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption
          color="danger"
          onClick={() => removeEvent(i)}
        >
          <IonIcon slot="icon-only" icon={trash} />
        </IonItemOption>
      </IonItemOptions>

    </IonItemSliding>
    </IonList>
  ))}

        <IonButton
          expand="block"
          onClick={addEvent}
        >
          Add Free Time
        </IonButton>

      </IonContent>

    </IonModal>
  )
}

export default FreeTimeModal